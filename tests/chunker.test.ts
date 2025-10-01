import { TextChunker } from '../mcp-server/src/lib/chunker';

describe('TextChunker', () => {
  let chunker: TextChunker;

  beforeEach(() => {
    chunker = new TextChunker(100, 20); // Small chunks for testing
  });

  test('should chunk a simple document', () => {
    const docId = 'test-doc-1';
    const title = 'Test Article';
    const text = 'This is a test article with some content. It has multiple sentences to test chunking functionality.';
    const label = 'real';

    const chunks = chunker.chunkDocument(docId, title, text, label);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].id).toBe(`${docId}_0`);
    expect(chunks[0].text).toBe(text);
    expect(chunks[0].metadata.docId).toBe(docId);
    expect(chunks[0].metadata.title).toBe(title);
    expect(chunks[0].metadata.label).toBe(label);
    expect(chunks[0].metadata.chunkIndex).toBe(0);
  });

  test('should chunk a long document into multiple chunks', () => {
    const docId = 'test-doc-2';
    const title = 'Long Test Article';
    const text = 'This is a very long test article. '.repeat(50); // Create a long text
    const label = 'fake';

    const chunks = chunker.chunkDocument(docId, title, text, label);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].metadata.chunkIndex).toBe(0);
    expect(chunks[1].metadata.chunkIndex).toBe(1);
  });

  test('should handle empty text', () => {
    const docId = 'test-doc-3';
    const title = 'Empty Article';
    const text = '';
    const label = 'real';

    const chunks = chunker.chunkDocument(docId, title, text, label);

    expect(chunks).toHaveLength(0);
  });

  test('should handle very short text', () => {
    const docId = 'test-doc-4';
    const title = 'Short Article';
    const text = 'Short';
    const label = 'real';

    const chunks = chunker.chunkDocument(docId, title, text, label);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].text).toBe(text);
  });

  test('should include URL in metadata when provided', () => {
    const docId = 'test-doc-5';
    const title = 'Test Article with URL';
    const text = 'This is a test article.';
    const label = 'real';
    const url = 'https://example.com/article';

    const chunks = chunker.chunkDocument(docId, title, text, label, url);

    expect(chunks[0].metadata.url).toBe(url);
  });
});
