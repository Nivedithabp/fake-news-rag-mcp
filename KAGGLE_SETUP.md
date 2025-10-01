# 🔑 Kaggle API Setup Guide

This guide will help you set up Kaggle API authentication to download the Fake and Real News dataset.

## 📋 Prerequisites

- A Kaggle account (free to create at [kaggle.com](https://kaggle.com))
- Access to the [Fake and Real News Dataset](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset)

## 🚀 Step-by-Step Setup

### Step 1: Create Kaggle Account

1. Go to [kaggle.com](https://kaggle.com)
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Accept Dataset License

1. Go to the [Fake and Real News Dataset](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset)
2. Click "I Understand and Accept" to accept the dataset license
3. This is required before you can download the dataset

### Step 3: Generate API Token

1. Go to your [Kaggle Account](https://www.kaggle.com/account) page
2. Scroll down to the "API" section
3. Click "Create New Token"
4. This will download a file called `kaggle.json`

### Step 4: Install Kaggle CLI

```bash
# Install kaggle CLI
pip install kaggle

# Or using conda
conda install -c conda-forge kaggle
```

### Step 5: Configure API Credentials

#### Option A: Using kaggle.json file (Recommended)

1. Create the kaggle directory:
   ```bash
   mkdir -p ~/.kaggle
   ```

2. Move the downloaded `kaggle.json` file:
   ```bash
   # On macOS/Linux
   mv ~/Downloads/kaggle.json ~/.kaggle/
   
   # On Windows
   move %USERPROFILE%\Downloads\kaggle.json %USERPROFILE%\.kaggle\
   ```

3. Set proper permissions (Linux/macOS):
   ```bash
   chmod 600 ~/.kaggle/kaggle.json
   ```

#### Option B: Using Environment Variables

1. Open the downloaded `kaggle.json` file
2. Copy the `username` and `key` values
3. Add them to your `.env` file:
   ```env
   KAGGLE_USERNAME=your_kaggle_username
   KAGGLE_KEY=your_kaggle_api_key
   ```

### Step 6: Test the Setup

```bash
# Test if kaggle CLI is working
kaggle datasets list --search "fake news"

# Test downloading a small dataset
kaggle datasets download -d clmentbisaillon/fake-and-real-news-dataset -p ./test --unzip
```

## 🔧 Troubleshooting

### Common Issues

1. **"403 Forbidden" Error**
   - Make sure you've accepted the dataset license
   - Verify your API token is correct
   - Check if the dataset is public and accessible

2. **"File not found" Error**
   - Ensure `kaggle.json` is in the correct location
   - Check file permissions (should be 600 on Linux/macOS)
   - Verify the file contains valid JSON

3. **"Dataset not found" Error**
   - Make sure you're using the correct dataset name
   - Check if the dataset is still available
   - Verify you have access to the dataset

### Verify Your Setup

```bash
# Check if kaggle.json exists and is readable
ls -la ~/.kaggle/kaggle.json

# Test API access
kaggle datasets list --user clmentbisaillon

# Test specific dataset access
kaggle datasets show clmentbisaillon/fake-and-real-news-dataset
```

## 🐳 Docker Setup

If you're using Docker, you can pass the credentials as environment variables:

```bash
# Add to your .env file
KAGGLE_USERNAME=your_kaggle_username
KAGGLE_KEY=your_kaggle_api_key

# Or pass directly to docker-compose
KAGGLE_USERNAME=your_username KAGGLE_KEY=your_key docker-compose up
```

## 🔒 Security Notes

- **Never commit `kaggle.json` to version control**
- The `.gitignore` file already excludes this file
- Use environment variables in production
- Rotate your API key periodically

## 📚 Additional Resources

- [Kaggle API Documentation](https://www.kaggle.com/docs/api)
- [Kaggle CLI Documentation](https://github.com/Kaggle/kaggle-api)
- [Dataset License Information](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset)

## ✅ Quick Verification

Once setup is complete, you should be able to run:

```bash
cd fake-news-rag-mcp
./kaggle/download_kaggle.sh
```

This should successfully download and preprocess the dataset without any authentication errors.
