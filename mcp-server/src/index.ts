import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { MCPHandler } from './mcp';
import { initializeVectorStore } from './lib/vectorstore';
import { initializeEmbeddings } from './lib/embeddings';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize services
let mcpHandler: MCPHandler;

async function initializeServices() {
  try {
    console.log('Initializing vector store...');
    const vectorStore = await initializeVectorStore();
    
    console.log('Initializing embeddings...');
    const embeddings = await initializeEmbeddings();
    
    console.log('Initializing MCP handler...');
    mcpHandler = new MCPHandler(vectorStore, embeddings);
    
    console.log('Services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      vectorStore: !!mcpHandler?.vectorStore,
      embeddings: !!mcpHandler?.embeddings
    }
  });
});

// MCP discovery endpoint
app.get('/mcp', (req, res) => {
  res.json({
    name: 'fake-news-rag',
    version: '0.1.0',
    description: 'MCP server: RAG over Fake vs Real News dataset',
    url: `${req.protocol}://${req.get('host')}/mcp`,
    tools: mcpHandler?.getTools() || []
  });
});

// MCP JSON-RPC endpoint
app.post('/mcp', async (req, res) => {
  try {
    if (!mcpHandler) {
      return res.status(503).json({
        jsonrpc: '2.0',
        id: req.body.id,
        error: {
          code: -32603,
          message: 'Server not initialized'
        }
      });
    }

    const result = await mcpHandler.handleRequest(req.body);
    res.json(result);
  } catch (error) {
    console.error('MCP request error:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id,
      error: {
        code: -32603,
        message: 'Internal server error',
        data: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

// Admin endpoints (protected by token)
app.use('/admin', (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const expectedToken = process.env.MCP_SERVER_ADMIN_TOKEN;
  
  if (!expectedToken || token !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
});

app.post('/admin/ingest', async (req, res) => {
  try {
    const { force } = req.body;
    const result = await mcpHandler?.handleRequest({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'mcp.invoke',
      params: {
        tool: 'mcp.index.ingest',
        params: { force: force || false }
      }
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Ingestion failed', details: error });
  }
});

app.post('/admin/clear', async (req, res) => {
  try {
    const result = await mcpHandler?.handleRequest({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'mcp.invoke',
      params: {
        tool: 'mcp.index.clear',
        params: {}
      }
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Clear failed', details: error });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  await initializeServices();
  
  app.listen(PORT, () => {
    console.log(`MCP server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer().catch(console.error);
