import { RAGAgent } from '../mcp-server/src/lib/rg_agent';
import { VectorStore, VectorPoint } from '../mcp-server/src/lib/vectorstore';
import { Embeddings } from '../mcp-server/src/lib/embeddings';

// Mock implementations
class MockVectorStore implements VectorStore {
  async createCollectionIfNotExists(collectionName: string): Promise<void> {}
  async upsertPoints(points: VectorPoint[]): Promise<void> {}
  async query(vector: number[], topK: number): Promise<VectorPoint[]> {
    return [
      {
        id: 'test-chunk-1',
        vector: vector,
        metadata: {
          docId: 'test-doc-1',
          title: 'Test Article 1',
          label: 'real',
          chunkIndex: 0,
          text: 'This is a test article about fake news detection.',
          score: 0.95
        }
      }
    ];
  }
  async clearCollection(collectionName: string): Promise<void> {}
  async getCollectionStats(collectionName: string): Promise<{ count: number }> {
    return { count: 1 };
  }
}

class MockEmbeddings implements Embeddings {
  async embed(texts: string[]): Promise<number[][]> {
    return texts.map(() => new Array(1536).fill(0.1));
  }
  getDimensions(): number {
    return 1536;
  }
}

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: 'This is a test response about fake news detection based on the provided sources.'
              }
            }]
          })
        }
      }
    }))
  };
});

describe('RAGAgent', () => {
  let ragAgent: RAGAgent;
  let mockVectorStore: MockVectorStore;
  let mockEmbeddings: MockEmbeddings;

  beforeEach(() => {
    // Set up environment variables
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.OPENAI_COMPLETION_MODEL = 'gpt-4o-mini';

    mockVectorStore = new MockVectorStore();
    mockEmbeddings = new MockEmbeddings();
    ragAgent = new RAGAgent(mockVectorStore, mockEmbeddings);
  });

  test('should answer a query with RAG', async () => {
    const query = 'What is fake news?';
    const result = await ragAgent.answerWithRAG(query, 4);

    expect(result).toHaveProperty('answer');
    expect(result).toHaveProperty('sources');
    expect(result).toHaveProperty('rawModelResponse');
    expect(result.answer).toContain('fake news');
    expect(result.sources).toHaveLength(1);
    expect(result.sources[0].docId).toBe('test-doc-1');
  });

  test('should handle empty search results', async () => {
    // Mock empty results
    mockVectorStore.query = jest.fn().mockResolvedValue([]);

    const query = 'What is fake news?';
    const result = await ragAgent.answerWithRAG(query, 4);

    expect(result.answer).toContain("I don't have any relevant information");
    expect(result.sources).toHaveLength(0);
  });

  test('should format sources correctly', async () => {
    const query = 'What is fake news?';
    const result = await ragAgent.answerWithRAG(query, 4);

    expect(result.sources[0]).toHaveProperty('docId');
    expect(result.sources[0]).toHaveProperty('chunkIndex');
    expect(result.sources[0]).toHaveProperty('score');
    expect(result.sources[0]).toHaveProperty('snippet');
    expect(result.sources[0]).toHaveProperty('label');
    expect(result.sources[0]).toHaveProperty('title');
  });
});
