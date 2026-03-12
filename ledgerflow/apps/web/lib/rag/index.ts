/**
 * RAG Module Index
 * Exporta todos los servicios del módulo RAG
 */

export { RAG_CONFIG, getClientNamespace } from './config';
export { chromaDB } from './chroma';
export { generateEmbeddings, generateRAGResponse, analyzeTransactions, openai } from './openai';
export {
  processFile,
  chunkText,
  getSupportedFiles,
  isSupportedFile,
  processPDF,
  processTXT,
  processExcel,
  processCSV,
  processXML,
} from './processors';
export {
  ingestSingleFile,
  ingestDirectory,
  updateClientFile,
  clearClientData,
  getIngestStats,
} from './ingest';
export {
  queryDocuments,
  queryTransactions,
  extractTransactionsFromDocuments,
  generateExecutiveSummary,
} from './query';

// Types
export type { ProcessedDocument, ChunkedDocument } from './processors';
export type { IngestResult } from './ingest';
export type { RAGQueryResult, TransactionQuery } from './query';
