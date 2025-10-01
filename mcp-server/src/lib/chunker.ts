export interface Chunk {
  id: string;
  text: string;
  metadata: {
    docId: string;
    title: string;
    label: string;
    chunkIndex: number;
    source?: string;
    url?: string;
  };
}

export class TextChunker {
  private chunkSize: number;
  private overlap: number;

  constructor(chunkSize: number = 1000, overlap: number = 200) {
    this.chunkSize = chunkSize;
    this.overlap = overlap;
  }

  chunkDocument(docId: string, title: string, text: string, label: string, url?: string): Chunk[] {
    const chunks: Chunk[] = [];
    
    // Split by paragraphs first
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    let currentChunk = '';
    let chunkIndex = 0;
    
    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      
      // If adding this paragraph would exceed chunk size, finalize current chunk
      if (currentChunk.length + trimmedParagraph.length > this.chunkSize && currentChunk.length > 0) {
        chunks.push(this.createChunk(docId, title, currentChunk.trim(), label, chunkIndex, url));
        chunkIndex++;
        
        // Start new chunk with overlap
        currentChunk = this.getOverlapText(currentChunk) + ' ' + trimmedParagraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmedParagraph;
      }
    }
    
    // Add the last chunk if it has content
    if (currentChunk.trim().length > 0) {
      chunks.push(this.createChunk(docId, title, currentChunk.trim(), label, chunkIndex, url));
    }
    
    // If no chunks were created (very short text), create one chunk
    if (chunks.length === 0 && text.trim().length > 0) {
      chunks.push(this.createChunk(docId, title, text.trim(), label, 0, url));
    }
    
    return chunks;
  }

  private createChunk(
    docId: string, 
    title: string, 
    text: string, 
    label: string, 
    chunkIndex: number, 
    url?: string
  ): Chunk {
    return {
      id: `${docId}_${chunkIndex}`,
      text,
      metadata: {
        docId,
        title,
        label,
        chunkIndex,
        source: 'kaggle',
        url
      }
    };
  }

  private getOverlapText(text: string): string {
    const words = text.split(' ');
    const overlapWords = Math.floor(this.overlap / 4); // Approximate 4 chars per word
    return words.slice(-overlapWords).join(' ');
  }

  // Token approximation (rough estimate: 4 characters = 1 token)
  private approximateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
