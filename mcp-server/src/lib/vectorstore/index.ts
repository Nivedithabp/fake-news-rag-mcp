import { VectorStore } from './chroma';
import { ChromaVectorStore } from './chroma';
import { PineconeVectorStore } from './pinecone';

export { VectorStore, VectorPoint } from './chroma';

export async function initializeVectorStore(): Promise<VectorStore> {
  const provider = process.env.VECTOR_DB_PROVIDER || 'chroma';
  
  if (provider === 'chroma') {
    const host = process.env.CHROMA_HOST || 'localhost';
    const port = parseInt(process.env.CHROMA_PORT || '8000');
    return new ChromaVectorStore(host, port);
  }
  
  if (provider === 'pinecone') {
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = process.env.PINECONE_ENV;
    
    if (!apiKey || !environment) {
      throw new Error('PINECONE_API_KEY and PINECONE_ENV environment variables are required for Pinecone');
    }
    
    return new PineconeVectorStore(apiKey, environment);
  }
  
  throw new Error(`Unsupported vector database provider: ${provider}`);
}
