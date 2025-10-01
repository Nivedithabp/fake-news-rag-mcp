<img width="1019" height="828" alt="Screenshot 2025-09-30 at 10 04 34 PM" src="https://github.com/user-attachments/assets/b819a49b-bdbe-43e0-8419-f1ec8ab31bcb" />

# Fake News RAG System

A complete RAG (Retrieval-Augmented Generation) application that analyzes news articles for authenticity using AI. Built with MCP server, Next.js frontend, and your Kaggle dataset.

## 🚀 Quick Start

### 1. Setup
```bash
git clone <repository-url>
cd fake-news-rag-mcp
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Kaggle credentials (required for dataset download)
```

### 3. Download Dataset
```bash
chmod +x kaggle/download_kaggle.sh
./kaggle/download_kaggle.sh
```

### 4. Start System
```bash
npm run dev
```

### 5. Access Application
- **Frontend**: http://localhost:3000 (or next available port)
- **MCP Server**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## 🎯 Features

- **✅ AI-Powered Analysis**: Detects fake news with confidence percentages
- **✅ Real-time Processing**: Instant analysis of news content
- **✅ Free Models**: Uses Hugging Face free models (no API costs!)
- **✅ Modern UI**: Clean, responsive Next.js interface
- **✅ MCP Protocol**: JSON-RPC 2.0 compliant server
- **✅ Vector Search**: Mock vector store (Pinecone ready)

## 📊 How It Works

1. **Data Processing**: Downloads and preprocesses Kaggle fake/real news dataset
2. **Vector Storage**: Converts articles to embeddings for similarity search
3. **RAG Pipeline**: Retrieves relevant articles and generates AI responses
4. **Analysis**: Provides confidence scores and detailed explanations

## 🔧 Current Status

- **Vector Database**: MockVectorStore (Pinecone connection issues)
- **Embeddings**: Mock embeddings (HuggingFace API issues)
- **LLM**: Rule-based responses with confidence scores
- **Dataset**: 2,000 balanced articles (1,000 fake, 1,000 real)

## 💡 Example Queries

Try these in the web interface:

- "Hey Facebook, As some of you may know, I'm Bill Gates. If you click that share link, I will give you $5,000..."
- "What are the main differences between fake and real news?"
- "How can we detect fake news?"

## 🛠️ Development

### Local Development
```bash
# Start MCP server
cd mcp-server && npm run dev

# Start frontend (separate terminal)
cd frontend && npm run dev
```

### Docker (Alternative)
```bash
docker-compose up -d
```

## 🔌 API Usage

### Query News
```bash
curl -X POST http://localhost:4000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "mcp.invoke",
    "params": {
      "tool": "mcp.rag.query",
      "params": {
        "query": "Is this fake news?",
        "topK": 3
      }
    }
  }'
```

### Check Status
```bash
curl http://localhost:4000/health
```

## 🐛 Troubleshooting

### Common Issues
1. **Port conflicts**: System automatically finds available ports
2. **API errors**: Falls back to mock/rule-based responses
3. **Dataset issues**: Check Kaggle credentials in `.env`

### Logs
```bash
# View server logs
npm run dev 2>&1 | grep "\[0\]"
```

## 📁 Project Structure

```
├── kaggle/           # Dataset processing
├── mcp-server/       # MCP server (port 4000)
├── frontend/         # Next.js app (port 3000+)
├── tests/           # Test suites
└── .env             # Configuration
```

## 🚀 Production

### Deploy to Vercel
```bash
cd frontend
vercel --prod
```

### Environment Variables
- `KAGGLE_USERNAME`: Your Kaggle username
- `KAGGLE_KEY`: Your Kaggle API key
- `PINECONE_API_KEY`: (Optional) For Pinecone vector DB
- `VECTOR_DB_PROVIDER`: `mock` or `pinecone`

## 📄 License

MIT License - see LICENSE file for details.

---

**Ready to detect fake news? Start the system and ask your first question! 🕵️‍♀️📰**