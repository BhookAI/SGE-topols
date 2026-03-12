/**
 * RAG Module Index - Client Safe
 * Solo exporta lo que es seguro usar en el cliente
 */

export { RAG_CONFIG, getClientNamespace } from './config';
export { generateEmbeddings, generateRAGResponse, analyzeTransactions, openai } from './openai';
export type { ProcessedDocument, ChunkedDocument } from './processors';
export type { IngestResult } from './ingest';
export type { RAGQueryResult, TransactionQuery } from './query';
