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
      if (Array.isArray(response)) {
        return response as number[][];
      } else if (Array.isArray(response[0])) {
        return response as number[][];
      } else {
        return [response as number[]];
      }
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

// Mock embeddings for development (completely free)
export class MockEmbeddings implements Embeddings {
  private dimensions: number;

  constructor(dimensions: number = 384) {
    this.dimensions = dimensions;
  }

  async embed(texts: string[]): Promise<number[][]> {
    try {
      console.log(`Generating mock embeddings for ${texts.length} texts`);
      
      // Generate deterministic mock embeddings based on text content
      const embeddings: number[][] = [];
      
      for (const text of texts) {
        const embedding = this.generateMockEmbedding(text);
        embeddings.push(embedding);
      }
      
      return embeddings;
    } catch (error) {
      console.error('Mock embedding error:', error);
      throw new Error(`Failed to generate mock embeddings: ${error}`);
    }
  }

  private generateMockEmbedding(text: string): number[] {
    // Create a deterministic embedding based on text content
    const hash = this.simpleHash(text);
    const embedding = new Array(this.dimensions).fill(0);
    
    // Use hash to generate pseudo-random but deterministic values
    for (let i = 0; i < this.dimensions; i++) {
      const seed = (hash + i) % 1000;
      embedding[i] = (Math.sin(seed) + 1) / 2; // Normalize to 0-1
    }
    
    return embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  getDimensions(): number {
    return this.dimensions;
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
      console.warn('Local embeddings not fully implemented. Using Mock embeddings instead.');
      
      // Fallback to Mock embeddings
      const mockEmbeddings = new MockEmbeddings(384);
      return await mockEmbeddings.embed(texts);
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
    try {
      // HuggingFace is free, API key is optional
      const apiKey = process.env.HF_API_KEY; // Optional for free tier
      const model = process.env.HF_EMBED_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';
      const hfEmbeddings = new HuggingFaceEmbeddings(apiKey, model);
      
      // Test the API with a simple request
      await hfEmbeddings.embed(['test']);
      console.log('HuggingFace embeddings initialized successfully');
      return hfEmbeddings;
    } catch (error) {
      console.warn('HuggingFace API failed, falling back to mock embeddings:', error);
      return new MockEmbeddings(384);
    }
  }
  
  if (provider === 'local') {
    const model = process.env.LOCAL_EMBED_MODEL || 'Xenova/all-MiniLM-L6-v2';
    return new LocalEmbeddings(model);
  }
  
  if (provider === 'mock') {
    console.log('Using mock embeddings for development');
    return new MockEmbeddings(384);
  }
  
  // Fallback to mock embeddings
  console.log('Using mock embeddings as fallback');
  return new MockEmbeddings(384);
}
