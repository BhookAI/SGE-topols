#!/usr/bin/env tsx
/**
 * Script CLI para consultas RAG
 * Uso: npm run query -- --client=CLIENT_ID --query="¿Cuáles son los gastos de marzo?"
 */

import { queryDocuments, queryTransactions, generateExecutiveSummary, extractTransactionsFromDocuments } from '../lib/rag';

interface CliOptions {
  client?: string;
  query?: string;
  type?: 'general' | 'transactions';
  summary?: boolean;
  extract?: boolean;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = { type: 'general' };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--client=')) {
      options.client = arg.split('=')[1];
    } else if (arg.startsWith('--query=')) {
      options.query = arg.split('=')[1];
    } else if (arg.startsWith('--type=')) {
      options.type = arg.split('=')[1] as CliOptions['type'];
    } else if (arg === '--summary') {
      options.summary = true;
    } else if (arg === '--extract') {
      options.extract = true;
    }
  }

  return options;
}

function printUsage() {
  console.log(`
Uso: npx tsx scripts/rag/query.ts [opciones]

Opciones:
  --client=ID          ID del cliente (requerido)
  --query="pregunta"   Pregunta a realizar
  --type=general       Tipo: general | transactions
  --summary            Generar resumen ejecutivo
  --extract            Extraer transacciones detectadas

Ejemplos:
  npx tsx scripts/rag/query.ts --client=acme-001 --query="¿Cuánto gastamos en marzo?"
  npx tsx scripts/rag/query.ts --client=acme-001 --type=transactions --query="facturas pendientes"
  npx tsx scripts/rag/query.ts --client=acme-001 --summary
  npx tsx scripts/rag/query.ts --client=acme-001 --extract
`);
}

async function main() {
  const options = parseArgs();

  // Validar client ID
  if (!options.client) {
    console.error('❌ Error: --client es requerido');
    printUsage();
    process.exit(1);
  }

  const clientId = options.client;
  console.log(`🦞 LedgerFlow RAG Query
Cliente: ${clientId}
`);

  try {
    // Modo resumen
    if (options.summary) {
      console.log('📝 Generando resumen ejecutivo...\n');
      const summary = await generateExecutiveSummary(clientId);
      console.log('='.repeat(60));
      console.log('RESUMEN EJECUTIVO');
      console.log('='.repeat(60));
      console.log(summary);
      console.log('='.repeat(60));
      return;
    }

    // Modo extracción
    if (options.extract) {
      console.log('💰 Extrayendo transacciones de documentos...\n');
      const transactions = await extractTransactionsFromDocuments(clientId);
      
      console.log(`Transacciones encontradas: ${transactions.length}\n`);
      
      if (transactions.length > 0) {
        // Agrupar por tipo
        const ingresos = transactions.filter(t => t.type === 'income');
        const gastos = transactions.filter(t => t.type === 'expense');
        
        console.log(`Ingresos: ${ingresos.length}`);
        console.log(`Gastos: ${gastos.length}\n`);
        
        console.log('Top 10 transacciones:');
        transactions.slice(0, 10).forEach((t, i) => {
          const icon = t.type === 'income' ? '💚' : '❤️';
          console.log(`${icon} ${t.date || 'N/A'} | ${t.description.slice(0, 40)}... | ₡${t.amount.toLocaleString()}`);
        });
      }
      return;
    }

    // Validar query
    if (!options.query) {
      console.error('❌ Error: --query es requerido (o usa --summary / --extract)');
      printUsage();
      process.exit(1);
    }

    // Realizar consulta
    console.log(`❓ Consulta: ${options.query}\n`);
    console.log('🔍 Buscando en documentos...\n');

    const startTime = Date.now();
    
    let result;
    if (options.type === 'transactions') {
      result = await queryTransactions(clientId, options.query);
    } else {
      result = await queryDocuments(clientId, options.query, 5);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('='.repeat(60));
    console.log('RESPUESTA');
    console.log('='.repeat(60));
    console.log(result.answer);
    console.log('='.repeat(60));
    console.log(`\n⏱️  Tiempo: ${duration}s | Confianza: ${(result.confidence * 100).toFixed(1)}%`);

    if (result.sources.length > 0) {
      console.log(`\n📚 Fuentes consultadas:`);
      result.sources.forEach((source, i) => {
        console.log(`  ${i + 1}. ${source.file} (relevancia: ${(source.relevance * 100).toFixed(0)}%)`);
      });
    }

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
