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

export class MockVectorStore implements VectorStore {
  private data: VectorPoint[] = [];
  private collectionName: string = 'fake-news-rag';

  async createCollectionIfNotExists(collectionName: string): Promise<void> {
    console.log(`Mock: Creating collection '${collectionName}'`);
    this.collectionName = collectionName;
  }

  async upsertPoints(points: VectorPoint[]): Promise<void> {
    console.log(`Mock: Upserting ${points.length} points`);
    this.data.push(...points);
  }

  async query(vector: number[], topK: number): Promise<VectorPoint[]> {
    console.log(`Mock: Querying with vector of length ${vector.length}, topK: ${topK}`);
    
    // Return mock data for testing
    return [
      {
        id: 'mock-doc-1',
        vector: vector,
        metadata: {
          docId: 'mock-doc-1',
          title: 'Sample Fake News Article',
          label: 'fake',
          chunkIndex: 0,
          text: 'This is a sample fake news article about sensational claims and unverified information.',
          score: 0.95
        }
      },
      {
        id: 'mock-doc-2',
        vector: vector,
        metadata: {
          docId: 'mock-doc-2',
          title: 'Sample Real News Article',
          label: 'real',
          chunkIndex: 0,
          text: 'This is a sample real news article with verified facts and credible sources.',
          score: 0.88
        }
      }
    ].slice(0, topK);
  }

  async clearCollection(collectionName: string): Promise<void> {
    console.log(`Mock: Clearing collection '${collectionName}'`);
    this.data = [];
  }

  async getCollectionStats(collectionName: string): Promise<{ count: number }> {
    return { count: this.data.length };
  }
}
