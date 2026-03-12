/**
 * RAG Module - Server Only Exports
 * Estos exports solo deben usarse en API routes o server components
 */

export { chromaDB } from './chroma';
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
