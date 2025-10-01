import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference';

export interface Embeddings {
  embed(texts: string[]): Promise<number[][]>;
  getDimensions(): number;
}

export class OpenAIEmbeddings implements Embeddings {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'text-embedding-3-small') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async embed(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.client.embeddings.create({
        model: this.model,
        input: texts,
        encoding_format: 'float'
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('OpenAI embedding error:', error);
      throw new Error(`Failed to generate embeddings: ${error}`);
    }
  }

  getDimensions(): number {
    // text-embedding-3-small has 1536 dimensions
    return 1536;
  }
}

export class HuggingFaceEmbeddings implements Embeddings {
  private client: HfInference;
  private model: string;

  constructor(apiKey: string, model: string = 'sentence-transformers/all-mpnet-base-v2') {
    this.client = new HfInference(apiKey);
    this.model = model;
  }

  async embed(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.client.featureExtraction({
        model: this.model,
        inputs: texts
      });

      // Convert to number[][] format
      return Array.isArray(response) ? response : [response as number[]];
    } catch (error) {
      console.error('HuggingFace embedding error:', error);
      throw new Error(`Failed to generate embeddings: ${error}`);
    }
  }

  getDimensions(): number {
    // all-mpnet-base-v2 has 768 dimensions
    return 768;
  }
}

export async function initializeEmbeddings(): Promise<Embeddings> {
  const provider = process.env.EMBEDDING_PROVIDER || 'openai';
  
  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    const model = process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small';
    return new OpenAIEmbeddings(apiKey, model);
  }
  
  if (provider === 'huggingface') {
    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) {
      throw new Error('HF_API_KEY environment variable is required');
    }
    
    const model = process.env.HF_EMBED_MODEL || 'sentence-transformers/all-mpnet-base-v2';
    return new HuggingFaceEmbeddings(apiKey, model);
  }
  
  throw new Error(`Unsupported embedding provider: ${provider}`);
}
