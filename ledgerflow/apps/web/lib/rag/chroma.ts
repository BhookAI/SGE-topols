import 'server-only';

/**
 * ChromaDB Client - Server Only
 * This module should only be imported in server components or API routes
 */

import { RAG_CONFIG, getClientNamespace } from './config';
import { ChromaClient, Collection } from 'chromadb';

class ChromaDBService {
  private client: ChromaClient;
  private collections: Map<string, Collection> = new Map();

  constructor() {
    this.client = new ChromaClient({
      path: RAG_CONFIG.chroma.url,
    });
  }

  async getOrCreateCollection(clientId: string): Promise<Collection> {
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

export const chromaDB = new ChromaDBService();
