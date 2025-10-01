import { z } from 'zod';
import { VectorStore } from './lib/vectorstore';
import { Embeddings } from './lib/embeddings';
import { RAGAgent } from './lib/rg_agent';
import { queryTool } from './tools/query';
import { statusTool } from './tools/status';
import { ingestTool } from './tools/ingest';
import { clearTool } from './tools/clear';

// JSON-RPC 2.0 schemas
const JsonRpcRequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]),
  method: z.string(),
  params: z.any().optional()
});

const JsonRpcResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]),
  result: z.any().optional(),
  error: z.object({
    code: z.number(),
    message: z.string(),
    data: z.any().optional()
  }).optional()
});

export type JsonRpcRequest = z.infer<typeof JsonRpcRequestSchema>;
export type JsonRpcResponse = z.infer<typeof JsonRpcResponseSchema>;

export class MCPHandler {
  private ragAgent: RAGAgent;
  private tools: Map<string, any> = new Map();

  constructor(
    public vectorStore: VectorStore,
    public embeddings: Embeddings
  ) {
    this.ragAgent = new RAGAgent(vectorStore, embeddings);
    this.initializeTools();
  }

  private initializeTools() {
    this.tools.set('mcp.rag.query', queryTool);
    this.tools.set('mcp.index.status', statusTool);
    this.tools.set('mcp.index.ingest', ingestTool);
    this.tools.set('mcp.index.clear', clearTool);
  }

  getTools() {
    return [
      {
        name: 'mcp.rag.query',
        description: 'Run a RAG query against the Fake vs Real News index',
        params: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'The question or query to search for' },
            topK: { type: 'integer', description: 'Number of top results to return (default: 4)', default: 4 }
          },
          required: ['query']
        }
      },
      {
        name: 'mcp.index.status',
        description: 'Get status and statistics of the news index',
        params: { type: 'object', properties: {} }
      },
      {
        name: 'mcp.index.ingest',
        description: 'Trigger re-ingestion of the news dataset',
        params: {
          type: 'object',
          properties: {
            force: { type: 'boolean', description: 'Force re-ingestion even if index exists', default: false }
          }
        }
      },
      {
        name: 'mcp.index.clear',
        description: 'Clear the news index (admin only)',
        params: { type: 'object', properties: {} }
      }
    ];
  }

  async handleRequest(request: any): Promise<JsonRpcResponse> {
    try {
      // Validate JSON-RPC request
      const validatedRequest = JsonRpcRequestSchema.parse(request);

      // Handle different methods
      switch (validatedRequest.method) {
        case 'mcp.discover':
          return {
            jsonrpc: '2.0',
            id: validatedRequest.id,
            result: {
              name: 'fake-news-rag',
              version: '0.1.0',
              description: 'MCP server: RAG over Fake vs Real News dataset',
              tools: this.getTools()
            }
          };

        case 'mcp.invoke':
          return await this.handleInvoke(validatedRequest);

        default:
          return {
            jsonrpc: '2.0',
            id: validatedRequest.id,
            error: {
              code: -32601,
              message: 'Method not found'
            }
          };
      }
    } catch (error) {
      console.error('Request validation error:', error);
      return {
        jsonrpc: '2.0',
        id: request.id || null,
        error: {
          code: -32600,
          message: 'Invalid Request',
          data: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  private async handleInvoke(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const { tool, params } = request.params || {};

    if (!tool) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32602,
          message: 'Missing tool parameter'
        }
      };
    }

    const toolHandler = this.tools.get(tool);
    if (!toolHandler) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32601,
          message: `Tool '${tool}' not found`
        }
      };
    }

    try {
      const result = await toolHandler(params || {}, this.ragAgent, this.vectorStore);
      return {
        jsonrpc: '2.0',
        id: request.id,
        result
      };
    } catch (error) {
      console.error(`Tool '${tool}' error:`, error);
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}
