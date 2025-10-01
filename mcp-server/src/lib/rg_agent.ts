import OpenAI from 'openai';
import { VectorStore, VectorPoint } from './vectorstore';
import { Embeddings } from './embeddings';

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
  private openai: OpenAI;
  private model: string;

  constructor(
    private vectorStore: VectorStore,
    private embeddings: Embeddings
  ) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.openai = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_COMPLETION_MODEL || 'gpt-4o-mini';
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
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant that answers questions using only the documents provided below. Always cite sources inline using [1], [2], etc. If you cannot answer from the documents, say "I don\'t know based on the dataset."'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      });

      const answer = response.choices[0]?.message?.content || 'No response generated';
      
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
        rawModelResponse: JSON.stringify(response, null, 2)
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
