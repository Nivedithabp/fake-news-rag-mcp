import { VectorStore, VectorPoint } from './vectorstore';
import { Embeddings } from './embeddings';
import { LLM, initializeLLM } from './llm';

export interface RAGResult {
  answer: string;
  sources: Array<{
    docId: string;
    chunkIndex: number;
    score: number;
    snippet: string;
    label: string;
    title: string;
    url?: string;
  }>;
  rawModelResponse: string;
}

export class RAGAgent {
  private llm: LLM;

  constructor(
    private vectorStore: VectorStore,
    private embeddings: Embeddings
  ) {
    // Initialize LLM will be called in the first use
    this.llm = null as any;
  }

  private async getLLM(): Promise<LLM> {
    if (!this.llm) {
      this.llm = await initializeLLM();
    }
    return this.llm;
  }

  async answerWithRAG(query: string, topK: number = 4): Promise<RAGResult> {
    try {
      // 1. Embed the query
      console.log(`Embedding query: "${query}"`);
      const queryEmbedding = await this.embeddings.embed([query]);
      
      // 2. Search for similar chunks
      console.log(`Searching for top ${topK} similar chunks...`);
      const similarChunks = await this.vectorStore.query(queryEmbedding[0], topK);
      
      if (similarChunks.length === 0) {
        return {
          answer: "I don't have any relevant information in the dataset to answer this question.",
          sources: [],
          rawModelResponse: "No relevant sources found"
        };
      }

      // 3. Build context with sources
      const context = this.buildContext(similarChunks);
      
      // 4. Create RAG prompt
      const prompt = this.createRAGPrompt(query, context);
      
      // 5. Call LLM
      console.log('Calling LLM for answer...');
      const llm = await this.getLLM();
      const systemPrompt = 'You are a research assistant that answers questions using only the documents provided below. Always cite sources inline using [1], [2], etc. If you cannot answer from the documents, say "I don\'t know based on the dataset."';
      
      const answer = await llm.generate(prompt, systemPrompt);
      
      // 6. Format sources
      const sources = similarChunks.map((chunk, index) => ({
        docId: chunk.metadata.docId,
        chunkIndex: chunk.metadata.chunkIndex,
        score: chunk.metadata.score || 0,
        snippet: chunk.metadata.text || '',
        label: chunk.metadata.label,
        title: chunk.metadata.title,
        url: chunk.metadata.url
      }));

      return {
        answer,
        sources,
        rawModelResponse: JSON.stringify({
          model: llm.getModelName(),
          answer: answer,
          timestamp: new Date().toISOString()
        }, null, 2)
      };

    } catch (error) {
      console.error('RAG error:', error);
      throw new Error(`RAG query failed: ${error}`);
    }
  }

  private buildContext(chunks: VectorPoint[]): string {
    return chunks.map((chunk, index) => {
      const sourceNum = index + 1;
      const title = chunk.metadata.title || 'Unknown Title';
      const label = chunk.metadata.label || 'unknown';
      const text = chunk.metadata.text || '';
      const score = chunk.metadata.score || 0;
      
      return `[${sourceNum}] (${title} - ${label}) ${text}`;
    }).join('\n\n');
  }

  private createRAGPrompt(query: string, context: string): string {
    return `You are a research assistant that answers questions using only the documents provided below.
Cite sources inline using [1], [2], ... If you cannot answer from the documents, say "I don't know based on the dataset."

Documents:
${context}

Question: ${query}

Provide a concise answer and include a short summary of which documents were most helpful.`;
  }
}
