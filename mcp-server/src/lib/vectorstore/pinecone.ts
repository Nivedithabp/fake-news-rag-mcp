import { Pinecone } from '@pinecone-database/pinecone';

export interface VectorPoint {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
}

export interface VectorStore {
  createCollectionIfNotExists(collectionName: string): Promise<void>;
  upsertPoints(points: VectorPoint[]): Promise<void>;
  query(vector: number[], topK: number): Promise<VectorPoint[]>;
  clearCollection(collectionName: string): Promise<void>;
  getCollectionStats(collectionName: string): Promise<{ count: number }>;
}

export class PineconeVectorStore implements VectorStore {
  private client: Pinecone;
  private index: any;
  private collectionName: string;

  constructor(apiKey: string, environment: string) {
    this.client = new Pinecone({
      apiKey,
      environment
    });
    this.collectionName = 'fake-news-rag';
  }

  async createCollectionIfNotExists(collectionName: string): Promise<void> {
    try {
      // Check if index exists
      const indexes = await this.client.listIndexes();
      const indexExists = indexes?.some((idx: any) => idx.name === collectionName);
      
      if (indexExists) {
        console.log(`Index '${collectionName}' already exists`);
        this.index = this.client.index(collectionName);
        return;
      }

      console.log(`Creating Pinecone index '${collectionName}'...`);
      
      // Create index with appropriate dimensions (384 for HuggingFace embeddings)
      await this.client.createIndex({
        name: collectionName,
        dimension: 384, // HuggingFace all-MiniLM-L6-v2 dimensions
        metric: 'cosine'
      });

      // Wait for index to be ready
      console.log('Waiting for index to be ready...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      this.index = this.client.index(collectionName);
      console.log(`Index '${collectionName}' created successfully`);
    } catch (error) {
      console.error('Pinecone index creation error:', error);
      throw new Error(`Failed to create Pinecone index: ${error}`);
    }
  }

  async upsertPoints(points: VectorPoint[]): Promise<void> {
    if (points.length === 0) return;

    try {
      if (!this.index) {
        this.index = this.client.index(this.collectionName);
      }

      // Convert points to Pinecone format
      const vectors = points.map(point => ({
        id: point.id,
        values: point.vector,
        metadata: point.metadata
      }));

      // Upsert in batches of 100 (Pinecone limit)
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await this.index.upsert(batch);
        console.log(`Upserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
      }

      console.log(`Upserted ${points.length} points to Pinecone`);
    } catch (error) {
      console.error('Pinecone upsert error:', error);
      throw new Error(`Failed to upsert points to Pinecone: ${error}`);
    }
  }

  async query(vector: number[], topK: number): Promise<VectorPoint[]> {
    try {
      if (!this.index) {
        this.index = this.client.index(this.collectionName);
      }

      const queryResponse = await this.index.query({
        vector,
        topK,
        includeMetadata: true,
        includeValues: false
      });

      const points: VectorPoint[] = [];
      
      if (queryResponse.matches) {
        for (const match of queryResponse.matches) {
          points.push({
            id: match.id || 'unknown',
            vector: vector, // Pinecone doesn't return the actual vector
            metadata: {
              ...match.metadata,
              score: match.score || 0
            }
          });
        }
      }

      return points;
    } catch (error) {
      console.error('Pinecone query error:', error);
      throw new Error(`Failed to query Pinecone: ${error}`);
    }
  }

  async clearCollection(collectionName: string): Promise<void> {
    try {
      if (!this.index) {
        this.index = this.client.index(collectionName);
      }

      // Delete all vectors by querying with a dummy vector and deleting all results
      // Note: This is a simplified approach. In production, you might want to use namespaces
      await this.index.deleteAll();
      console.log(`Cleared index '${collectionName}'`);
    } catch (error) {
      console.error('Pinecone clear error:', error);
      throw new Error(`Failed to clear index: ${error}`);
    }
  }

  async getCollectionStats(collectionName: string): Promise<{ count: number }> {
    try {
      if (!this.index) {
        this.index = this.client.index(collectionName);
      }

      const stats = await this.index.describeIndexStats();
      return { count: stats.totalVectorCount || 0 };
    } catch (error) {
      console.error('Pinecone stats error:', error);
      return { count: 0 };
    }
  }
}
