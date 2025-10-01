#!/bin/bash

# Script to download the Fake and Real News Dataset from Kaggle
# Requires kaggle CLI to be installed and configured

set -e

echo "Downloading Fake and Real News Dataset from Kaggle..."

# Check if kaggle CLI is installed
if ! command -v kaggle &> /dev/null; then
    echo "Error: kaggle CLI is not installed. Please install it first:"
    echo "pip install kaggle"
    exit 1
fi

# Check if kaggle credentials are configured
if [ ! -f ~/.kaggle/kaggle.json ] && [ -z "$KAGGLE_USERNAME" ] && [ -z "$KAGGLE_KEY" ]; then
    echo "❌ Error: Kaggle credentials not found!"
    echo ""
    echo "Please set up Kaggle API authentication:"
    echo "1. Go to https://www.kaggle.com/account"
    echo "2. Create API token and download kaggle.json"
    echo "3. Place it in ~/.kaggle/kaggle.json"
    echo "4. Set permissions: chmod 600 ~/.kaggle/kaggle.json"
    echo ""
    echo "📖 For detailed setup instructions, see KAGGLE_SETUP.md"
    echo ""
    echo "Alternative: Use environment variables:"
    echo "export KAGGLE_USERNAME=your_username"
    echo "export KAGGLE_KEY=your_api_key"
    exit 1
fi

# Use environment variables if kaggle.json is not available
if [ ! -f ~/.kaggle/kaggle.json ] && [ -n "$KAGGLE_USERNAME" ] && [ -n "$KAGGLE_KEY" ]; then
    echo "Using environment variables for Kaggle authentication"
    export KAGGLE_USERNAME
    export KAGGLE_KEY
fi

# Create output directory
mkdir -p ./kaggle

# Download the dataset
echo "Downloading dataset..."
kaggle datasets download -d clmentbisaillon/fake-and-real-news-dataset -p ./kaggle --unzip

# Check if files were downloaded
if [ ! -f "./kaggle/Fake.csv" ] || [ ! -f "./kaggle/True.csv" ]; then
    echo "Error: Expected CSV files not found after download"
    exit 1
fi

echo "Dataset downloaded successfully!"
echo "Files:"
ls -la ./kaggle/

# Run preprocessing
echo "Running preprocessing..."
python3 kaggle/preprocess.py --input-dir ./kaggle --out ./kaggle/preprocessed.jsonl

echo "Preprocessing complete! Check ./kaggle/preprocessed.jsonl"
