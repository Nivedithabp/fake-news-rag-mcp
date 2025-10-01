import { VectorStore } from '../lib/vectorstore';

export async function clearTool(params: any, ragAgent: any, vectorStore: VectorStore) {
  try {
    const collectionName = 'fake-news-rag';
    
    // Get current stats before clearing
    const statsBefore = await vectorStore.getCollectionStats(collectionName);
    
    // Clear the collection
    console.log('Clearing collection...');
    await vectorStore.clearCollection(collectionName);
    
    // Verify it's cleared
    const statsAfter = await vectorStore.getCollectionStats(collectionName);
    
    return {
      success: true,
      message: 'Collection cleared successfully',
      countBefore: statsBefore.count,
      countAfter: statsAfter.count,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Clear tool error:', error);
    return {
      success: false,
      message: 'Failed to clear collection',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}
