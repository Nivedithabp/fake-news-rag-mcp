import { VectorStore } from '../lib/vectorstore';

export async function statusTool(params: any, ragAgent: any, vectorStore: VectorStore) {
  try {
    const collectionName = 'fake-news-rag';
    
    // Get collection statistics
    const stats = await vectorStore.getCollectionStats(collectionName);
    
    // Get vector store provider info
    const provider = process.env.VECTOR_DB_PROVIDER || 'chroma';
    
    return {
      status: 'healthy',
      provider,
      collection: collectionName,
      totalDocuments: stats.count,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        embeddingProvider: process.env.EMBEDDING_PROVIDER || 'openai',
        embeddingModel: process.env.OPENAI_EMBED_MODEL || process.env.HF_EMBED_MODEL || 'text-embedding-3-small',
        completionModel: process.env.OPENAI_COMPLETION_MODEL || 'gpt-4o-mini'
      }
    };
  } catch (error) {
    console.error('Status tool error:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}
