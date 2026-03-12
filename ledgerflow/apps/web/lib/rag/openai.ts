/**
 * OpenAI Service
 * Servicio para generar embeddings y chat completions
 */

import OpenAI from 'openai';
import { RAG_CONFIG } from './config';

const openai = new OpenAI({
  apiKey: RAG_CONFIG.openai.apiKey,
});

/**
 * Genera embeddings para un texto o array de textos
 */
export async function generateEmbeddings(
  texts: string | string[]
): Promise<number[][]> {
  const input = Array.isArray(texts) ? texts : [texts];
  
  // Filtrar textos vacíos
  const validInputs = input.filter(t => t.trim().length > 0);
  
  if (validInputs.length === 0) {
    return [];
  }

  const response = await openai.embeddings.create({
    model: RAG_CONFIG.openai.embeddingModel,
    input: validInputs,
  });

  return response.data.map(d => d.embedding);
}

/**
 * Genera una respuesta basada en contexto RAG
 */
export async function generateRAGResponse(
  query: string,
  context: string[],
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
  const systemPrompt = `Eres un asistente experto en contabilidad y gestión financiera para el sistema LedgerFlow.
Tu tarea es analizar documentos financieros y responder preguntas basándote ÚNICAMENTE en el contexto proporcionado.

Instrucciones:
1. Responde basándote ÚNICAMENTE en la información del contexto
2. Si la información no está en el contexto, indica claramente "No tengo información sobre eso en los documentos proporcionados"
3. Para preguntas numéricas (saldos, totales), verifica los números cuidadosamente
4. Presenta la información de manera clara y estructurada
5. Si hay inconsistencias en los documentos, menciónalas

Contexto de documentos:
${context.join('\n\n---\n\n')}`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: query },
  ];

  const response = await openai.chat.completions.create({
    model: RAG_CONFIG.openai.chatModel,
    messages,
    temperature: 0.3,
    max_tokens: 2000,
  });

  return response.choices[0].message.content || 'No se pudo generar una respuesta';
}

/**
 * Analiza transacciones y extrae insights
 */
export async function analyzeTransactions(
  transactions: Array<{
    type: string;
    amount: number;
    date: string;
    description: string;
    category?: string;
  }>
): Promise<string> {
  const prompt = `Analiza las siguientes transacciones financieras y proporciona insights:

Transacciones:
${JSON.stringify(transactions, null, 2)}

Proporciona un análisis breve que incluya:
1. Total de ingresos vs gastos
2. Categorías principales
3. Observaciones o anomalías
4. Recomendaciones si las hay`;

  const response = await openai.chat.completions.create({
    model: RAG_CONFIG.openai.chatModel,
    messages: [
      { role: 'system', content: 'Eres un experto contable que analiza transacciones financieras.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  return response.choices[0].message.content || 'No se pudo generar el análisis';
}

export { openai };
