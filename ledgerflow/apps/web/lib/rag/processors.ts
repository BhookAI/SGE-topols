/**
 * Document Processors
 * Procesadores para diferentes tipos de archivos
 */

import * as fs from 'fs';
import * as path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { RAG_CONFIG } from '../config';

export interface ProcessedDocument {
  content: string;
  metadata: {
    source_file: string;
    file_type: string;
    total_pages?: number;
    sheet_names?: string[];
    processed_at: string;
  };
}

export interface ChunkedDocument {
  chunks: string[];
  metadata: ProcessedDocument['metadata'] & {
    chunk_index: number;
    total_chunks: number;
  }[];
}

/**
 * Divide texto en chunks con solapamiento
 */
export function chunkText(
  text: string,
  chunkSize: number = RAG_CONFIG.textProcessing.chunkSize,
  overlap: number = RAG_CONFIG.textProcessing.chunkOverlap
): string[] {
  const chunks: string[] = [];
  let i = 0;
  
  while (i < text.length) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push(chunk);
    i += chunkSize - overlap;
  }
  
  return chunks.filter(c => c.trim().length > 0);
}

/**
 * Procesa archivos PDF
 */
export async function processPDF(filePath: string): Promise<ProcessedDocument> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  
  return {
    content: data.text,
    metadata: {
      source_file: path.basename(filePath),
      file_type: 'pdf',
      total_pages: data.numpages,
      processed_at: new Date().toISOString(),
    },
  };
}

/**
 * Procesa archivos de texto plano
 */
export async function processTXT(filePath: string): Promise<ProcessedDocument> {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  return {
    content,
    metadata: {
      source_file: path.basename(filePath),
      file_type: 'txt',
      processed_at: new Date().toISOString(),
    },
  };
}

/**
 * Procesa archivos Word (.docx)
 */
export async function processDOCX(filePath: string): Promise<ProcessedDocument> {
  const result = await mammoth.extractRawText({ path: filePath });
  
  return {
    content: result.value,
    metadata: {
      source_file: path.basename(filePath),
      file_type: 'docx',
      processed_at: new Date().toISOString(),
    },
  };
}

/**
 * Procesa archivos Excel (.xlsx, .xls)
 */
export async function processExcel(filePath: string): Promise<ProcessedDocument> {
  const workbook = XLSX.readFile(filePath);
  const sheetNames = workbook.SheetNames;
  
  let fullContent = '';
  
  for (const sheetName of sheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    fullContent += `\n=== HOJA: ${sheetName} ===\n`;
    
    // Convertir a formato legible
    for (const row of jsonData) {
      if (Array.isArray(row) && row.some(cell => cell !== undefined && cell !== '')) {
        fullContent += row.join(' | ') + '\n';
      }
    }
  }
  
  return {
    content: fullContent,
    metadata: {
      source_file: path.basename(filePath),
      file_type: 'excel',
      sheet_names: sheetNames,
      processed_at: new Date().toISOString(),
    },
  };
}

/**
 * Procesa archivos CSV
 */
export async function processCSV(filePath: string): Promise<ProcessedDocument> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  
  // Convertir a texto estructurado
  const textContent = records.map((record: any, index: number) => {
    return `Registro ${index + 1}:\n${Object.entries(record)
      .map(([key, value]) => `  ${key}: ${value}`)
      .join('\n')}`;
  }).join('\n\n');
  
  return {
    content: textContent,
    metadata: {
      source_file: path.basename(filePath),
      file_type: 'csv',
      processed_at: new Date().toISOString(),
    },
  };
}

/**
 * Procesa facturas XML (CFDI, UBL, etc.)
 */
export async function processXML(filePath: string): Promise<ProcessedDocument> {
  const xml2js = await import('xml2js');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(content);
  
  // Extraer información relevante de facturas
  let extractedInfo = '';
  
  // Intentar detectar formato CFDI (México)
  if (result['cfdi:Comprobante']) {
    const cfdi = result['cfdi:Comprobante'];
    extractedInfo = `FACTURA CFDI
Folio: ${cfdi.$.Folio || 'N/A'}
Fecha: ${cfdi.$.Fecha || 'N/A'}
Total: ${cfdi.$.Total || 'N/A'}
Subtotal: ${cfdi.$.SubTotal || 'N/A'}
Emisor: ${cfdi['cfdi:Emisor']?.$.Nombre || 'N/A'} (${cfdi['cfdi:Emisor']?.$.Rfc || 'N/A'})
Receptor: ${cfdi['cfdi:Receptor']?.$.Nombre || 'N/A'} (${cfdi['cfdi:Receptor']?.$.Rfc || 'N/A'})

Conceptos:
`;
    const conceptos = cfdi['cfdi:Conceptos']?.['cfdi:Concepto'];
    if (conceptos) {
      const lista = Array.isArray(conceptos) ? conceptos : [conceptos];
      lista.forEach((c: any) => {
        extractedInfo += `- ${c.$.Descripcion}: ${c.$.Cantidad} x $${c.$.ValorUnitario} = $${c.$.Importe}\n`;
      });
    }
  } else {
    // Formato genérico
    extractedInfo = JSON.stringify(result, null, 2);
  }
  
  return {
    content: extractedInfo,
    metadata: {
      source_file: path.basename(filePath),
      file_type: 'xml_invoice',
      processed_at: new Date().toISOString(),
    },
  };
}

/**
 * Procesa archivos JSON
 */
export async function processJSON(filePath: string): Promise<ProcessedDocument> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  // Formatear de manera legible
  const formatted = JSON.stringify(data, null, 2);
  
  return {
    content: formatted,
    metadata: {
      source_file: path.basename(filePath),
      file_type: 'json',
      processed_at: new Date().toISOString(),
    },
  };
}

/**
 * Procesa cualquier archivo según su extensión
 */
export async function processFile(filePath: string): Promise<ProcessedDocument> {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.pdf':
      return processPDF(filePath);
    case '.txt':
      return processTXT(filePath);
    case '.docx':
      return processDOCX(filePath);
    case '.xlsx':
    case '.xls':
      return processExcel(filePath);
    case '.csv':
      return processCSV(filePath);
    case '.xml':
      return processXML(filePath);
    case '.json':
      return processJSON(filePath);
    default:
      throw new Error(`Formato de archivo no soportado: ${ext}`);
  }
}

/**
 * Verifica si un archivo es soportado
 */
export function isSupportedFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return RAG_CONFIG.fileProcessing.supportedFormats.includes(ext);
}

/**
 * Obtiene todos los archivos soportados de un directorio
 */
export function getSupportedFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  
  const files = fs.readdirSync(dirPath);
  return files
    .map(f => path.join(dirPath, f))
    .filter(f => fs.statSync(f).isFile())
    .filter(isSupportedFile);
}
