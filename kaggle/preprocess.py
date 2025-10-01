#!/usr/bin/env python3
"""
Preprocessing script for the Fake and Real News Dataset.
Cleans, deduplicates, and normalizes the data for RAG ingestion.
"""

import argparse
import csv
import hashlib
import json
import re
from pathlib import Path
from typing import Dict, List, Set
import pandas as pd


def clean_text(text: str) -> str:
    """Clean and normalize text content."""
    if not text or not isinstance(text, str):
        return ""
    
    # Remove extra whitespace and normalize
    text = re.sub(r'\s+', ' ', text.strip())
    
    # Remove URLs
    text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
    
    # Remove email addresses
    text = re.sub(r'\S+@\S+', '', text)
    
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s.,!?;:()\-]', '', text)
    
    return text.strip()


def generate_doc_id(title: str, text: str) -> str:
    """Generate a unique document ID based on content hash."""
    content = f"{title}|{text}"
    return hashlib.md5(content.encode('utf-8')).hexdigest()[:16]


def process_csv_file(file_path: Path, label: str) -> List[Dict]:
    """Process a CSV file and return cleaned documents."""
    documents = []
    seen_hashes: Set[str] = set()
    
    print(f"Processing {file_path} with label: {label}")
    
    try:
        df = pd.read_csv(file_path)
        print(f"Found {len(df)} rows in {file_path}")
        
        for idx, row in df.iterrows():
            # Extract fields (handle different column names)
            title = ""
            text = ""
            url = ""
            date = ""
            
            # Map common column names
            for col in df.columns:
                col_lower = col.lower()
                if 'title' in col_lower:
                    title = str(row[col]) if pd.notna(row[col]) else ""
                elif 'text' in col_lower or 'content' in col_lower or 'article' in col_lower:
                    text = str(row[col]) if pd.notna(row[col]) else ""
                elif 'url' in col_lower or 'link' in col_lower:
                    url = str(row[col]) if pd.notna(row[col]) else ""
                elif 'date' in col_lower or 'time' in col_lower:
                    date = str(row[col]) if pd.notna(row[col]) else ""
            
            # Clean the text
            title = clean_text(title)
            text = clean_text(text)
            
            # Skip if too short
            if len(text) < 100 or len(title) < 10:
                continue
            
            # Generate hash for deduplication
            content_hash = hashlib.md5(f"{title}{text}".encode('utf-8')).hexdigest()
            if content_hash in seen_hashes:
                continue
            seen_hashes.add(content_hash)
            
            # Generate document ID
            doc_id = generate_doc_id(title, text)
            
            document = {
                "docId": doc_id,
                "title": title,
                "text": text,
                "label": label,
                "url": url,
                "date": date,
                "source": "kaggle"
            }
            
            documents.append(document)
            
            if len(documents) % 1000 == 0:
                print(f"Processed {len(documents)} documents...")
    
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return []
    
    print(f"Successfully processed {len(documents)} documents from {file_path}")
    return documents


def main():
    parser = argparse.ArgumentParser(description="Preprocess Fake and Real News Dataset")
    parser.add_argument("--input-dir", required=True, help="Input directory containing CSV files")
    parser.add_argument("--out", required=True, help="Output JSONL file path")
    parser.add_argument("--min-length", type=int, default=100, help="Minimum text length")
    parser.add_argument("--max-docs", type=int, default=None, help="Maximum number of documents to process")
    
    args = parser.parse_args()
    
    input_dir = Path(args.input_dir)
    output_file = Path(args.out)
    
    if not input_dir.exists():
        print(f"Error: Input directory {input_dir} does not exist")
        return 1
    
    all_documents = []
    
    # Process Fake.csv
    fake_file = input_dir / "Fake.csv"
    if fake_file.exists():
        fake_docs = process_csv_file(fake_file, "fake")
        all_documents.extend(fake_docs)
    else:
        print(f"Warning: {fake_file} not found")
    
    # Process True.csv
    true_file = input_dir / "True.csv"
    if true_file.exists():
        true_docs = process_csv_file(true_file, "real")
        all_documents.extend(true_docs)
    else:
        print(f"Warning: {true_file} not found")
    
    # Apply max docs limit if specified
    if args.max_docs and len(all_documents) > args.max_docs:
        print(f"Limiting to {args.max_docs} documents")
        all_documents = all_documents[:args.max_docs]
    
    # Write to JSONL
    print(f"Writing {len(all_documents)} documents to {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        for doc in all_documents:
            f.write(json.dumps(doc, ensure_ascii=False) + '\n')
    
    # Print statistics
    fake_count = sum(1 for doc in all_documents if doc['label'] == 'fake')
    real_count = sum(1 for doc in all_documents if doc['label'] == 'real')
    
    print(f"\nPreprocessing complete!")
    print(f"Total documents: {len(all_documents)}")
    print(f"Fake news: {fake_count}")
    print(f"Real news: {real_count}")
    print(f"Output file: {output_file}")
    
    return 0


if __name__ == "__main__":
    exit(main())
