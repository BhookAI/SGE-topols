/**
 * RAG Query Service
 * Servicio para consultas inteligentes
 */

import { chromaDB } from './chroma';
import { generateEmbeddings, generateRAGResponse, analyzeTransactions } from './openai';

export interface RAGQueryResult {
  answer: string;
  sources: Array<{
    file: string;
    content: string;
    relevance: number;
  }>;
  confidence: number;
}

export interface TransactionQuery {
  clientId: string;
  query: string;
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    type?: 'income' | 'expense';
    category?: string;
  };
}

/**
 * Realiza una consulta RAG sobre los documentos del cliente
 */
export async function queryDocuments(
  clientId: string,
  query: string,
  topK: number = 5
): Promise<RAGQueryResult> {
  // Generar embedding de la consulta
  const [queryEmbedding] = await generateEmbeddings([query]);
  
  // Buscar documentos similares
  const searchResults = await chromaDB.search(clientId, queryEmbedding, topK);
  
  if (searchResults.documents.length === 0) {
    return {
      answer: 'No encontré información relevante en los documentos del cliente.',
      sources: [],
      confidence: 0,
    };
  }

  // Calcular confianza basada en distancias (menor distancia = mayor confianza)
  const avgDistance = searchResults.distances.reduce((a, b) => a + b, 0) / searchResults.distances.length;
  const confidence = Math.max(0, Math.min(1, 1 - avgDistance));

  // Generar respuesta con contexto
  const context = searchResults.documents;
  const answer = await generateRAGResponse(query, context);

  // Preparar fuentes
  const sources = searchResults.documents.map((doc, i) => ({
    file: searchResults.metadatas[i]?.source_file || 'Unknown',
    content: doc.slice(0, 500) + (doc.length > 500 ? '...' : ''),
    relevance: 1 - (searchResults.distances[i] || 0),
  }));

  return {
    answer,
    sources,
    confidence,
  };
}

/**
 * Consulta específica para transacciones financieras
 */
export async function queryTransactions(
  clientId: string,
  query: string
): Promise<RAGQueryResult> {
  // Enriquecer la query con contexto financiero
  const enrichedQuery = `Transacciones financieras: ${query}`;
  
  return queryDocuments(clientId, enrichedQuery, 10);
}

/**
 * Extrae transacciones de documentos procesados
 */
export async function extractTransactionsFromDocuments(
  clientId: string
): Promise<Array<{
  type: string;
  amount: number;
  date: string;
  description: string;
  category?: string;
  sourceFile: string;
}>> {
  // Buscar todos los documentos relacionados con transacciones
  const [embedding] = await generateEmbeddings(['transacciones movimientos gastos ingresos']);
  const results = await chromaDB.search(clientId, embedding, 20);
  
  const transactions: any[] = [];
  
  // Procesar cada chunk buscando patrones de transacciones
  for (let i = 0; i < results.documents.length; i++) {
    const doc = results.documents[i];
    const metadata = results.metadatas[i];
    
    // Regex para encontrar montos y fechas (básico)
    const lines = doc.split('\n');
    
    for (const line of lines) {
      // Buscar patrones de montos (₡, $, etc.)
      const amountMatch = line.match(/[₡$€]\s*([\d,]+\.?\d*)/);
      const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
      
      if (amountMatch && dateMatch) {
        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        const isExpense = /gasto|egreso|compra|pago/i.test(line);
        const isIncome = /ingreso|venta|cobro|depósito/i.test(line);
        
        transactions.push({
          type: isIncome ? 'income' : isExpense ? 'expense' : 'unknown',
          amount,
          date: dateMatch[1],
          description: line.slice(0, 200),
          category: detectCategory(line),
          sourceFile: metadata?.source_file || 'Unknown',
        });
      }
    }
  }
  
  return transactions;
}

/**
 * Detecta categoría basada en descripción
 */
function detectCategory(text: string): string {
  const categories: Record<string, RegExp> = {
    'Comida': /restaurant|comida|almuerzo|cena|desayuno|supermercado/i,
    'Transporte': /gasolina|transporte|uber|taxi|bus|pasaje/i,
    'Oficina': /papelería|oficina|material|impresión|toner/i,
    'Servicios': /internet|luz|agua|teléfono|celular/i,
    'Salud': /farmacia|doctor|medicina|salud|clínica/i,
    'Ventas': /venta|cliente|factura|cobro|ingreso/i,
  };
  
  for (const [category, regex] of Object.entries(categories)) {
    if (regex.test(text)) return category;
  }
  
  return 'General';
}

/**
 * Genera resumen ejecutivo de documentos
 */
export async function generateExecutiveSummary(
  clientId: string
): Promise<string> {
  const query = 'Resumen general de todos los documentos, transacciones principales, ingresos, gastos y hallazgos importantes';
  
  const [embedding] = await generateEmbeddings([query]);
  const results = await chromaDB.search(clientId, embedding, 15);
  
  if (results.documents.length === 0) {
    return 'No hay documentos procesados para este cliente.';
  }
  
  const prompt = `Genera un resumen ejecutivo basado en los siguientes documentos financieros:

${results.documents.join('\n\n---\n\n')}

El resumen debe incluir:
1. Visión general de la situación financiera
2. Principales ingresos y gastos identificados
3. Observaciones importantes o anomalías
4. Recomendaciones si aplica`;

  // Usar el servicio de OpenAI directamente
  const { openai } = require('./openai');
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: 'Eres un experto contable que genera resúmenes ejecutivos.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 1500,
  });

  return response.choices[0].message.content || 'No se pudo generar el resumen';
}
