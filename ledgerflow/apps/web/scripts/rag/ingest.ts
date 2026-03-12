#!/usr/bin/env tsx
/**
 * Script CLI para ingestión de documentos
 * Uso: npm run ingest -- --client=CLIENT_ID --path=/ruta/a/documentos
 */

import { ingestDirectory, ingestSingleFile, getIngestStats, clearClientData } from '../lib/rag';
import * as fs from 'fs';
import * as path from 'path';

interface CliOptions {
  client?: string;
  path?: string;
  file?: string;
  clear?: boolean;
  stats?: boolean;
  dryRun?: boolean;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--client=')) {
      options.client = arg.split('=')[1];
    } else if (arg.startsWith('--path=')) {
      options.path = arg.split('=')[1];
    } else if (arg.startsWith('--file=')) {
      options.file = arg.split('=')[1];
    } else if (arg === '--clear') {
      options.clear = true;
    } else if (arg === '--stats') {
      options.stats = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    }
  }

  return options;
}

function printUsage() {
  console.log(`
Uso: npm run ingest -- [opciones]

Opciones:
  --client=ID          ID del cliente (requerido)
  --path=/ruta         Ruta al directorio con documentos
  --file=/archivo      Procesar un archivo específico
  --clear              Limpiar datos existentes antes de ingest
  --stats              Mostrar estadísticas del cliente
  --dry-run            Simular sin guardar cambios

Ejemplos:
  npm run ingest -- --client=acme-001 --path=./client-data/acme
  npm run ingest -- --client=acme-001 --file=./factura.pdf
  npm run ingest -- --client=acme-001 --stats
  npm run ingest -- --client=acme-001 --clear --path=./nuevos-docs
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
  console.log(`🦞 LedgerFlow RAG Ingest
Cliente: ${clientId}
`);

  try {
    // Modo estadísticas
    if (options.stats) {
      console.log('📊 Obteniendo estadísticas...');
      const stats = await getIngestStats(clientId);
      console.log(`
Estadísticas del cliente:
  Documentos indexados: ${stats.totalDocuments}
`);
      return;
    }

    // Validar ruta
    const targetPath = options.file || options.path;
    if (!targetPath) {
      console.error('❌ Error: --path o --file es requerido');
      printUsage();
      process.exit(1);
    }

    if (!fs.existsSync(targetPath)) {
      console.error(`❌ Error: La ruta no existe: ${targetPath}`);
      process.exit(1);
    }

    // Modo dry-run
    if (options.dryRun) {
      console.log('🔍 MODO DRY-RUN (sin guardar cambios)\n');
      const isFile = fs.statSync(targetPath).isFile();
      
      if (isFile) {
        console.log(`Archivo encontrado: ${path.basename(targetPath)}`);
      } else {
        const files = fs.readdirSync(targetPath)
          .map(f => path.join(targetPath, f))
          .filter(f => fs.statSync(f).isFile());
        console.log(`Directorio: ${targetPath}`);
        console.log(`Archivos encontrados: ${files.length}`);
        files.forEach(f => console.log(`  - ${path.basename(f)}`));
      }
      return;
    }

    // Limpiar si se solicita
    if (options.clear) {
      console.log('🗑️  Limpiando datos existentes...');
      await clearClientData(clientId);
      console.log('✅ Datos eliminados\n');
    }

    // Procesar
    console.log('🔄 Iniciando procesamiento...\n');
    
    let result;
    const startTime = Date.now();

    if (options.file) {
      console.log(`📄 Procesando archivo: ${path.basename(options.file)}`);
      result = await ingestSingleFile(clientId, options.file);
      
      if (result.success) {
        console.log(`✅ Archivo procesado exitosamente`);
        console.log(`   Chunks creados: ${result.chunks}`);
      } else {
        console.error(`❌ Error: ${result.error}`);
        process.exit(1);
      }
    } else {
      console.log(`📁 Procesando directorio: ${options.path}`);
      result = await ingestDirectory(clientId, options.path!);
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(`\n✅ Procesamiento completado en ${duration}s\n`);
      console.log(`Resumen:`);
      console.log(`  Archivos procesados: ${result.filesProcessed}`);
      console.log(`  Total chunks: ${result.totalChunks}`);
      console.log(`  Errores: ${result.errors.length}`);
      
      if (result.details.length > 0) {
        console.log(`\nDetalles:`);
        result.details.forEach(d => {
          console.log(`  ✓ ${d.file} (${d.fileType}) - ${d.chunks} chunks`);
        });
      }
      
      if (result.errors.length > 0) {
        console.log(`\nErrores:`);
        result.errors.forEach(e => {
          console.log(`  ✗ ${e.file}: ${e.error}`);
        });
      }
    }

    // Mostrar estadísticas finales
    const finalStats = await getIngestStats(clientId);
    console.log(`\n📊 Total documentos en base de datos: ${finalStats.totalDocuments}`);
    console.log('\n🎉 Listo! La información está disponible para consultas RAG.');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
