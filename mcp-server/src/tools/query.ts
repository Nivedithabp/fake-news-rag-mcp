import { z } from 'zod';
import { RAGAgent } from '../lib/rg_agent';
import { VectorStore } from '../lib/vectorstore';

const QueryParamsSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty'),
  topK: z.number().int().min(1).max(20).optional().default(4)
});

export async function queryTool(params: any, ragAgent: RAGAgent, vectorStore: VectorStore) {
  try {
    const { query, topK } = QueryParamsSchema.parse(params);
    
    console.log(`RAG query: "${query}" (topK: ${topK})`);
    
    const result = await ragAgent.answerWithRAG(query, topK);
    
    return {
      answer: result.answer,
      sources: result.sources,
      rawModelResponse: result.rawModelResponse,
      query,
      topK,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Query tool error:', error);
    throw new Error(`Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
