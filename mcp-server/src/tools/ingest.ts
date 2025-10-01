import { z } from 'zod';
import * as path from 'path';
import { VectorStore } from '../lib/vectorstore';
import { Embeddings } from '../lib/embeddings';
import { KaggleLoader } from '../lib/kaggle_loader';

const IngestParamsSchema = z.object({
  force: z.boolean().optional().default(false)
});

export async function ingestTool(params: any, ragAgent: any, vectorStore: VectorStore) {
  try {
    const { force } = IngestParamsSchema.parse(params);
    const collectionName = 'fake-news-rag';
    
    // Check if collection already exists and has data
    if (!force) {
      const stats = await vectorStore.getCollectionStats(collectionName);
      if (stats.count > 0) {
        return {
          success: false,
          message: 'Collection already exists and has data. Use force=true to re-ingest.',
          currentCount: stats.count,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // Clear existing collection if force is true
    if (force) {
      console.log('Clearing existing collection...');
      await vectorStore.clearCollection(collectionName);
    }
    
    // Create collection
    console.log('Creating collection...');
    await vectorStore.createCollectionIfNotExists(collectionName);
    
    // Load and chunk documents
    const dataPath = process.env.KAGGLE_DATA_PATH || path.join(process.cwd(), '../kaggle/preprocessed.jsonl');
    console.log(`Loading data from: ${dataPath}`);
    
    const loader = new KaggleLoader();
    const chunks = await loader.loadAndChunk(dataPath);
    
    if (chunks.length === 0) {
      return {
        success: false,
        message: 'No documents found to ingest',
        timestamp: new Date().toISOString()
      };
    }
    
    // Initialize embeddings
    const embeddings = await import('../lib/embeddings').then(m => m.initializeEmbeddings());
    
    // Embed chunks in batches
    const batchSize = 100;
    const totalBatches = Math.ceil(chunks.length / batchSize);
    
    console.log(`Embedding ${chunks.length} chunks in ${totalBatches} batches...`);
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      
      console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} chunks)...`);
      
      // Embed the batch
      const texts = batch.map(chunk => chunk.text);
      const vectors = await embeddings.embed(texts);
      
      // Convert to vector points
      const points = batch.map((chunk, index) => ({
        id: chunk.id,
        vector: vectors[index],
        metadata: chunk.metadata
      }));
      
      // Upsert to vector store
      await vectorStore.upsertPoints(points);
      
      console.log(`Completed batch ${batchNum}/${totalBatches}`);
    }
    
    // Get final stats
    const finalStats = await vectorStore.getCollectionStats(collectionName);
    
    return {
      success: true,
      message: 'Ingestion completed successfully',
      totalChunks: chunks.length,
      totalBatches,
      finalCount: finalStats.count,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Ingest tool error:', error);
    return {
      success: false,
      message: 'Ingestion failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}
