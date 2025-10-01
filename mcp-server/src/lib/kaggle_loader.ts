import * as fs from 'fs';
import * as path from 'path';
import { TextChunker, Chunk } from './chunker';

export interface NewsDocument {
  docId: string;
  title: string;
  text: string;
  label: string;
  url?: string;
  date?: string;
  source: string;
}

export class KaggleLoader {
  private chunker: TextChunker;

  constructor() {
    this.chunker = new TextChunker(1000, 200); // 1000 chars, 200 overlap
  }

  async loadDocuments(filePath: string): Promise<NewsDocument[]> {
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      const lines = data.trim().split('\n');
      
      const documents: NewsDocument[] = [];
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const doc = JSON.parse(line);
            documents.push(doc as NewsDocument);
          } catch (error) {
            console.warn(`Failed to parse line: ${line.substring(0, 100)}...`);
          }
        }
      }
      
      console.log(`Loaded ${documents.length} documents from ${filePath}`);
      return documents;
    } catch (error) {
      console.error(`Failed to load documents from ${filePath}:`, error);
      throw new Error(`Failed to load documents: ${error}`);
    }
  }

  async chunkDocuments(documents: NewsDocument[]): Promise<Chunk[]> {
    const allChunks: Chunk[] = [];
    
    console.log(`Chunking ${documents.length} documents...`);
    
    for (const doc of documents) {
      const chunks = this.chunker.chunkDocument(
        doc.docId,
        doc.title,
        doc.text,
        doc.label,
        doc.url
      );
      
      allChunks.push(...chunks);
      
      if (allChunks.length % 1000 === 0) {
        console.log(`Chunked ${allChunks.length} chunks so far...`);
      }
    }
    
    console.log(`Generated ${allChunks.length} chunks from ${documents.length} documents`);
    return allChunks;
  }

  async loadAndChunk(filePath: string): Promise<Chunk[]> {
    const documents = await this.loadDocuments(filePath);
    return await this.chunkDocuments(documents);
  }

  // Utility method to get dataset statistics
  getDatasetStats(documents: NewsDocument[]): {
    total: number;
    fake: number;
    real: number;
    avgTextLength: number;
    avgTitleLength: number;
  } {
    const fake = documents.filter(doc => doc.label === 'fake').length;
    const real = documents.filter(doc => doc.label === 'real').length;
    
    const totalTextLength = documents.reduce((sum, doc) => sum + doc.text.length, 0);
    const totalTitleLength = documents.reduce((sum, doc) => sum + doc.title.length, 0);
    
    return {
      total: documents.length,
      fake,
      real,
      avgTextLength: Math.round(totalTextLength / documents.length),
      avgTitleLength: Math.round(totalTitleLength / documents.length)
    };
  }
}
