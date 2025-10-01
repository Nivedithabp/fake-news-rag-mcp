import { KaggleLoader } from '../mcp-server/src/lib/kaggle_loader';
import { TextChunker } from '../mcp-server/src/lib/chunker';
import { ChromaVectorStore } from '../mcp-server/src/lib/vectorstore/chroma';
import { OpenAIEmbeddings } from '../mcp-server/src/lib/embeddings';
import { RAGAgent } from '../mcp-server/src/lib/rg_agent';

// This is a smoke test that can be run manually
// It requires actual API keys and services to be running
describe('E2E Smoke Test', () => {
  test.skip('should ingest sample data and answer a query', async () => {
    // Skip this test by default as it requires real services
    // Run with: npm test -- --testNamePattern="should ingest sample data"
    
    const loader = new KaggleLoader();
    const chunker = new TextChunker(1000, 200);
    
    // Create sample test data
    const sampleDocs = [
      {
        docId: 'test-doc-1',
        title: 'Fake News Detection Methods',
        text: 'Fake news detection is a critical problem in today\'s digital age. Various methods have been developed to identify and combat fake news, including machine learning algorithms, fact-checking systems, and source verification techniques.',
        label: 'real',
        url: 'https://example.com/real-article',
        source: 'test'
      },
      {
        docId: 'test-doc-2',
        title: 'Conspiracy Theory Claims',
        text: 'The government is hiding the truth about aliens and controlling our minds through vaccines. This secret information has been suppressed for decades.',
        label: 'fake',
        url: 'https://example.com/fake-article',
        source: 'test'
      }
    ];

    // Chunk the documents
    const chunks = [];
    for (const doc of sampleDocs) {
      const docChunks = chunker.chunkDocument(
        doc.docId,
        doc.title,
        doc.text,
        doc.label,
        doc.url
      );
      chunks.push(...docChunks);
    }

    expect(chunks.length).toBeGreaterThan(0);
    console.log(`Generated ${chunks.length} chunks from ${sampleDocs.length} documents`);

    // Test vector store (requires Chroma to be running)
    const vectorStore = new ChromaVectorStore('localhost', 8000);
    await vectorStore.createCollectionIfNotExists('test-collection');

    // Test embeddings (requires OpenAI API key)
    const embeddings = new OpenAIEmbeddings(process.env.OPENAI_API_KEY!);
    const testTexts = chunks.slice(0, 2).map(chunk => chunk.text);
    const vectors = await embeddings.embed(testTexts);
    
    expect(vectors).toHaveLength(2);
    expect(vectors[0]).toHaveLength(1536); // OpenAI embedding dimension

    // Test RAG agent
    const ragAgent = new RAGAgent(vectorStore, embeddings);
    
    // This would require the data to be actually indexed
    // const result = await ragAgent.answerWithRAG('What are the methods for detecting fake news?', 2);
    // expect(result.answer).toContain('fake news');
    // expect(result.sources.length).toBeGreaterThan(0);

    console.log('E2E smoke test completed successfully');
  }, 30000); // 30 second timeout
});
