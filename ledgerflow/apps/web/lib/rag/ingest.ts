/**
 * Ingest Service
 * Servicio principal para ingestión de documentos
 */

import { chromaDB } from './chroma';
import { generateEmbeddings } from './openai';
import {
  processFile,
  chunkText,
  getSupportedFiles,
  isSupportedFile,
  ProcessedDocument,
} from './processors';
import * as fs from 'fs';
import * as path from 'path';

export interface IngestResult {
  success: boolean;
  filesProcessed: number;
  totalChunks: number;
  errors: Array<{ file: string; error: string }>;
  details: Array<{
    file: string;
    chunks: number;
    fileType: string;
  }>;
}

/**
 * Procesa un único archivo y lo indexa
 */
export async function ingestSingleFile(
  clientId: string,
  filePath: string
): Promise<{ success: boolean; chunks: number; error?: string }> {
  try {
    if (!isSupportedFile(filePath)) {
      return { success: false, chunks: 0, error: 'Formato no soportado' };
    }

    // Procesar archivo
    const processed = await processFile(filePath);
    
    // Dividir en chunks
    const chunks = chunkText(processed.content);
    
    if (chunks.length === 0) {
      return { success: false, chunks: 0, error: 'No se pudo extraer contenido' };
    }

    // Generar embeddings
    const embeddings = await generateEmbeddings(chunks);
    
    // Preparar metadatos
    const metadatas = chunks.map((_, index) => ({
      ...processed.metadata,
      chunk_index: index,
      total_chunks: chunks.length,
    }));

    // Guardar en ChromaDB
    await chromaDB.addDocuments(clientId, chunks, embeddings, metadatas);

    return { success: true, chunks: chunks.length };
  } catch (error) {
    return {
      success: false,
      chunks: 0,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Procesa todos los archivos de un directorio
 */
export async function ingestDirectory(
  clientId: string,
  directoryPath: string
): Promise<IngestResult> {
  const result: IngestResult = {
    success: true,
    filesProcessed: 0,
    totalChunks: 0,
    errors: [],
    details: [],
  };

  if (!fs.existsSync(directoryPath)) {
    return {
      ...result,
      success: false,
      errors: [{ file: directoryPath, error: 'Directorio no existe' }],
    };
  }

  const files = getSupportedFiles(directoryPath);

  if (files.length === 0) {
    return {
      ...result,
      errors: [{ file: directoryPath, error: 'No se encontraron archivos soportados' }],
    };
  }

  for (const filePath of files) {
    const fileResult = await ingestSingleFile(clientId, filePath);
    
    if (fileResult.success) {
      result.filesProcessed++;
      result.totalChunks += fileResult.chunks;
      result.details.push({
        file: path.basename(filePath),
        chunks: fileResult.chunks,
        fileType: path.extname(filePath).toLowerCase(),
      });
    } else {
      result.errors.push({
        file: path.basename(filePath),
        error: fileResult.error || 'Error desconocido',
      });
    }
  }

  result.success = result.filesProcessed > 0;
  return result;
}

/**
 * Actualiza/Recarga un archivo específico
 */
export async function updateClientFile(
  clientId: string,
  filePath: string
): Promise<IngestResult> {
  // Primero eliminar versiones anteriores del archivo
  await chromaDB.deleteBySourceFile(clientId, path.basename(filePath));
  
  // Ingerir nueva versión
  const result = await ingestSingleFile(clientId, filePath);
  
  return {
    success: result.success,
    filesProcessed: result.success ? 1 : 0,
    totalChunks: result.chunks,
    errors: result.error ? [{ file: path.basename(filePath), error: result.error }] : [],
    details: result.success
      ? [{ file: path.basename(filePath), chunks: result.chunks, fileType: path.extname(filePath) }]
      : [],
  };
}

/**
 * Limpia toda la data de un cliente
 */
export async function clearClientData(clientId: string): Promise<void> {
  await chromaDB.deleteClientCollection(clientId);
}

/**
 * Obtiene estadísticas de ingestión
 */
export async function getIngestStats(clientId: string): Promise<{
  totalDocuments: number;
  lastIngest?: string;
}> {
  const stats = await chromaDB.getStats(clientId);
  return {
    totalDocuments: stats.count,
  };
}
