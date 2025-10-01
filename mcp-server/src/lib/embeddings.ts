import { HfInference } from '@huggingface/inference';

export interface Embeddings {
  embed(texts: string[]): Promise<number[][]>;
  getDimensions(): number;
}

export class HuggingFaceEmbeddings implements Embeddings {
  private client: HfInference;
  private model: string;

  constructor(apiKey?: string, model: string = 'sentence-transformers/all-MiniLM-L6-v2') {
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
    // all-MiniLM-L6-v2 has 384 dimensions
    return 384;
  }
}

// Local embeddings using transformers.js (completely free)
export class LocalEmbeddings implements Embeddings {
  private model: string;

  constructor(model: string = 'Xenova/all-MiniLM-L6-v2') {
    this.model = model;
  }

  async embed(texts: string[]): Promise<number[][]> {
    try {
      // This would require transformers.js to be installed
      // For now, we'll use a simple fallback
      console.warn('Local embeddings not fully implemented. Using HuggingFace instead.');
      
      // Fallback to HuggingFace without API key
      const hfEmbeddings = new HuggingFaceEmbeddings(undefined, 'sentence-transformers/all-MiniLM-L6-v2');
      return await hfEmbeddings.embed(texts);
    } catch (error) {
      console.error('Local embedding error:', error);
      throw new Error(`Failed to generate local embeddings: ${error}`);
    }
  }

  getDimensions(): number {
    return 384;
  }
}

export async function initializeEmbeddings(): Promise<Embeddings> {
  const provider = process.env.EMBEDDING_PROVIDER || 'huggingface';
  
  if (provider === 'huggingface') {
    // HuggingFace is free, API key is optional
    const apiKey = process.env.HF_API_KEY; // Optional for free tier
    const model = process.env.HF_EMBED_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';
    return new HuggingFaceEmbeddings(apiKey, model);
  }
  
  if (provider === 'local') {
    const model = process.env.LOCAL_EMBED_MODEL || 'Xenova/all-MiniLM-L6-v2';
    return new LocalEmbeddings(model);
  }
  
  // Fallback to free HuggingFace
  console.log('Using free HuggingFace embeddings as fallback');
  return new HuggingFaceEmbeddings(undefined, 'sentence-transformers/all-MiniLM-L6-v2');
}
