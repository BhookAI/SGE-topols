/**
 * RAG Configuration
 * Configuración centralizada para ChromaDB y OpenAI
 */

export const RAG_CONFIG = {
  // ChromaDB Configuration
  chroma: {
    url: process.env.CHROMA_URL || 'http://localhost:8000',
    collectionName: 'ledgerflow_documents',
    distance: 'cosine' as const,
  },
  
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    embeddingModel: 'text-embedding-3-small',
    embeddingDimensions: 1536,
    chatModel: 'gpt-4-turbo-preview',
  },
  
  // Text Processing
  textProcessing: {
    chunkSize: 1000,
    chunkOverlap: 200,
    maxTokensPerChunk: 8000,
  },
  
  // File Processing
  fileProcessing: {
    supportedFormats: ['.pdf', '.txt', '.csv', '.xlsx', '.xls', '.xml', '.json'],
    maxFileSize: 50 * 1024 * 1024, // 50MB
  }
};

// Namespace por cliente para aislamiento multi-tenant
export function getClientNamespace(clientId: string): string {
  return `client_${clientId.replace(/[^a-zA-Z0-9]/g, '_')}`;
}
