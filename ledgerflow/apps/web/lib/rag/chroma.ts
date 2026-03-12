/**
 * ChromaDB Client - Universal Version
 * Works in both Node.js server and safely in browser builds
 */

import { RAG_CONFIG, getClientNamespace } from './config';

// Types for ChromaDB
type ChromaClientType = any;
type CollectionType = any;

// Check if we're in a Node.js environment
const isNode = typeof process !== 'undefined' && process.versions?.node;

// Mock implementation for browser/edge builds
const mockChromaDB = {
  async getOrCreateCollection() {
    throw new Error('ChromaDB is only available in Node.js server environment');
  },
  async addDocuments() {
    throw new Error('ChromaDB is only available in Node.js server environment');
  },
  async search() {
    return { documents: [], metadatas: [], distances: [] };
  },
  async deleteClientCollection() {
    // No-op
  },
  async deleteBySourceFile() {
    // No-op
  },
  async getStats() {
    return { count: 0 };
  }
};

// Real implementation for Node.js
class ChromaDBService {
  private client: ChromaClientType | null = null;
  private collections: Map<string, CollectionType> = new Map();
  private initialized = false;

  private async init() {
    if (this.initialized) return;
    if (!isNode) return;
    
    try {
      // Dynamic import only works in Node.js
      const { ChromaClient } = await import('chromadb');
      
      this.client = new ChromaClient({
        path: RAG_CONFIG.chroma.url,
      });
      
      this.initialized = true;
    } catch (error) {
      console.warn('ChromaDB initialization failed:', error);
    }
  }

  async getOrCreateCollection(clientId: string): Promise<CollectionType> {
    await this.init();
    if (!this.client) throw new Error('ChromaDB not available');
    
    const namespace = getClientNamespace(clientId);
    
    if (this.collections.has(namespace)) {
      return this.collections.get(namespace)!;
    }

    const collection = await this.client.getOrCreateCollection({
      name: `${RAG_CONFIG.chroma.collectionName}_${namespace}`,
      metadata: {
        clientId,
        createdAt: new Date().toISOString(),
        distance: RAG_CONFIG.chroma.distance,
      },
    });

    this.collections.set(namespace, collection);
    return collection;
  }

  async addDocuments(
    clientId: string,
    documents: string[],
    embeddings: number[][],
    metadatas: Record<string, any>[]
  ): Promise<void> {
    const collection = await this.getOrCreateCollection(clientId);
    
    const ids = documents.map((_, i) => 
      `${getClientNamespace(clientId)}_${Date.now()}_${i}`
    );

    await collection.add({
      ids,
      documents,
      embeddings,
      metadatas,
    });
  }

  async search(
    clientId: string,
    queryEmbedding: number[],
    topK: number = 5
  ): Promise<{ documents: string[]; metadatas: any[]; distances: number[] }> {
    const collection = await this.getOrCreateCollection(clientId);
    
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
    });

    return {
      documents: results.documents[0] || [],
      metadatas: results.metadatas[0] || [],
      distances: results.distances?.[0] || [],
    };
  }

  async deleteClientCollection(clientId: string): Promise<void> {
    await this.init();
    if (!this.client) return;
    
    const namespace = getClientNamespace(clientId);
    const collectionName = `${RAG_CONFIG.chroma.collectionName}_${namespace}`;
    
    try {
      await this.client.deleteCollection({ name: collectionName });
      this.collections.delete(namespace);
    } catch (error) {
      console.log(`Collection ${collectionName} no existe o ya fue eliminada`);
    }
  }

  async deleteBySourceFile(clientId: string, sourceFile: string): Promise<void> {
    const collection = await this.getOrCreateCollection(clientId);
    
    const results = await collection.get({
      where: { source_file: sourceFile },
    });

    if (results.ids.length > 0) {
      await collection.delete({ ids: results.ids });
    }
  }

  async getStats(clientId: string): Promise<{ count: number }> {
    const collection = await this.getOrCreateCollection(clientId);
    const count = await collection.count();
    return { count };
  }
}

// Export singleton - use mock in browser, real in Node.js
export const chromaDB = isNode ? new ChromaDBService() : mockChromaDB;
