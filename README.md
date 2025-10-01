
<img width="1019" height="828" alt="Screenshot 2025-09-30 at 10 04 34 PM" src="https://github.com/user-attachments/assets/b819a49b-bdbe-43e0-8419-f1ec8ab31bcb" />

# Fake vs Real News RAG Application

A complete RAG (Retrieval-Augmented Generation) application that uses the Kaggle "Fake and Real News Dataset" to provide AI-powered fact-checking and news analysis through a Model Context Protocol (MCP) server and Next.js frontend.

## 🚀 Features

- **Dataset Processing**: Downloads and preprocesses the Kaggle Fake and Real News dataset
- **Vector Search**: Supports both Chroma (local) and Pinecone (cloud) vector databases
- **RAG Pipeline**: Chunks articles, generates embeddings, and provides contextual answers
- **MCP Server**: JSON-RPC 2.0 compliant server exposing RAG tools
- **Modern Frontend**: Next.js 14 with Tailwind CSS and responsive design
- **Docker Support**: Complete containerization with docker-compose
- **Production Ready**: Vercel deployment configuration and security best practices
- **🆓 Completely Free**: Uses Hugging Face free models - no API costs!

## 📁 Project Structure

```
/
├── kaggle/                    # Data processing scripts
│   ├── download_kaggle.sh    # Kaggle dataset download
│   └── preprocess.py         # Data cleaning and preprocessing
├── mcp-server/               # MCP server implementation
│   ├── src/
│   │   ├── tools/            # MCP tool implementations
│   │   ├── lib/              # Core libraries (RAG, embeddings, vector stores)
│   │   └── index.ts          # Express server entry point
│   └── Dockerfile
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # React components
│   │   └── api/              # API routes
│   └── Dockerfile
├── tests/                    # Test suites
├── docker-compose.yml        # Local development setup
└── README.md
```

## 🆓 Free AI Models

This application uses **completely free** AI models:

- **Embeddings**: Hugging Face `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions)
- **Text Generation**: Hugging Face `microsoft/DialoGPT-medium` or rule-based fallback
- **Alternative**: Ollama with local models (llama2, mistral, etc.)
- **Fallback**: Rule-based responses when no API is available

**No OpenAI API key required!** The application works out of the box with free models.

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Kaggle account and API credentials (see [KAGGLE_SETUP.md](KAGGLE_SETUP.md) for detailed setup)
- **No AI API keys required for basic usage!** (Uses free Hugging Face models)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd fake-news-rag-mcp
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Free AI Models (No API keys required!)
EMBEDDING_PROVIDER=huggingface
LLM_PROVIDER=huggingface

# Required for dataset download
KAGGLE_USERNAME=your_kaggle_username
KAGGLE_KEY=your_kaggle_api_key

# Optional (for Pinecone)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENV=your_pinecone_environment_here
VECTOR_DB_PROVIDER=pinecone  # or 'chroma' for local
```

### 3. Download and Process Dataset

```bash
# Make download script executable
chmod +x kaggle/download_kaggle.sh

# Download and preprocess the dataset
./kaggle/download_kaggle.sh
```

### 4. Start with Docker Compose

```bash
# Start all services (Chroma, MCP server, Frontend)
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **MCP Server**: http://localhost:4000
- **Chroma DB**: http://localhost:8000
- **Health Check**: http://localhost:4000/health

### 6. Ingest Data

1. Go to http://localhost:3000/ingest
2. Click "Ingest Dataset" to process and index the data
3. Monitor the status and document count

### 7. Start Querying

1. Go to http://localhost:3000
2. Ask questions like:
   - "What are the main differences between fake and real news?"
   - "What topics are commonly covered in fake news?"
   - "How can we detect fake news?"

## 🔧 Development

### Local Development (without Docker)

```bash
# Terminal 1: Start Chroma
docker run -p 8000:8000 chromadb/chroma:latest

# Terminal 2: Start MCP Server
cd mcp-server
npm install
npm run dev

# Terminal 3: Start Frontend
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:mcp
npm run test:frontend

# Run E2E smoke test (requires API keys)
npm test -- --testNamePattern="should ingest sample data"
```

## 🌐 Production Deployment

### Option 1: Vercel + Render/Fly

1. **Deploy Frontend to Vercel**:

   ```bash
   cd frontend
   vercel --prod
   ```

2. **Deploy MCP Server to Render/Fly**:

   - Use the `mcp-server/Dockerfile`
   - Set environment variables
   - Configure health checks

3. **Use Pinecone for Vector Storage**:
   - Create Pinecone index
   - Set `VECTOR_DB_PROVIDER=pinecone`
   - Configure Pinecone credentials

### Option 2: Full Docker Deployment

```bash
# Build and deploy with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🔌 MCP Server API

The MCP server exposes the following tools:

### `mcp.rag.query`

Query the news dataset with RAG.

**Parameters:**

- `query` (string, required): The question to ask
- `topK` (integer, optional): Number of results to return (default: 4)

**Example:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "mcp.invoke",
  "params": {
    "tool": "mcp.rag.query",
    "params": {
      "query": "What is fake news?",
      "topK": 4
    }
  }
}
```

### `mcp.index.status`

Get index statistics and system status.

### `mcp.index.ingest`

Trigger dataset ingestion.

### `mcp.index.clear`

Clear the index (admin only).

## 🧪 Example Queries

Try these example queries to test the system:

1. **"What are the main characteristics of fake news?"**

   - Should return information about sensationalism, lack of sources, etc.

2. **"How do real news articles differ from fake ones?"**

   - Should highlight credibility, fact-checking, source verification

3. **"What topics are commonly covered in fake news?"**

   - Should identify political, health, and conspiracy topics

4. **"What methods can be used to detect fake news?"**
   - Should return information about fact-checking, source verification

## 🔒 Security & Privacy

- **API Keys**: Never commit API keys to version control
- **Rate Limiting**: MCP server includes rate limiting (100 requests/15min)
- **Admin Protection**: Admin endpoints require authentication token
- **Data Privacy**: Only stores text snippets, not full articles
- **HTTPS**: Use HTTPS in production for all communications

## 🐛 Troubleshooting

### Common Issues

1. **Chroma Connection Failed**:

   ```bash
   # Check if Chroma is running
   docker ps | grep chroma
   # Restart if needed
   docker-compose restart chroma
   ```

2. **OpenAI API Errors**:

   - Verify API key is correct
   - Check rate limits and billing
   - Ensure model access permissions

3. **Kaggle Download Fails**:

   - Verify Kaggle credentials in `~/.kaggle/kaggle.json`
   - Check dataset permissions
   - Ensure internet connectivity

4. **Frontend Can't Connect to MCP**:
   - Verify MCP server is running on port 4000
   - Check `MCP_SERVER_URL` environment variable
   - Review browser console for CORS errors

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs mcp-server
docker-compose logs frontend
docker-compose logs chroma

# Follow logs in real-time
docker-compose logs -f mcp-server
```

## 📊 Performance Considerations

- **Chunk Size**: Default 1000 characters with 200 overlap
- **Batch Processing**: Embeddings processed in batches of 100
- **Caching**: Consider Redis for query result caching
- **CDN**: Use CDN for static assets in production
- **Monitoring**: Add application performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Kaggle Fake and Real News Dataset](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset)
- [OpenAI](https://openai.com/) for embeddings and language models
- [Chroma](https://www.trychroma.com/) for vector storage
- [Pinecone](https://www.pinecone.io/) for managed vector database
- [Next.js](https://nextjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

For issues and questions:

1. Check the troubleshooting section
2. Review the logs
3. Create an issue on GitHub
4. Contact the development team

---

**Happy fact-checking! 🕵️‍♀️📰**
