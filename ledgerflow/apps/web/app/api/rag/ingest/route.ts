import { NextRequest, NextResponse } from 'next/server';
import { ingestDirectory, ingestSingleFile, updateClientFile, clearClientData, getIngestStats } from '@/lib/rag';
import * as fs from 'fs';
import * as path from 'path';

/**
 * POST /api/rag/ingest
 * Ingesta documentos de un cliente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, folderPath, filePath, dryRun = false, clearExisting = false } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId es requerido' },
        { status: 400 }
      );
    }

    // Validar que existe folderPath o filePath
    if (!folderPath && !filePath) {
      return NextResponse.json(
        { error: 'folderPath o filePath es requerido' },
        { status: 400 }
      );
    }

    // Si es dry-run, solo verificar
    if (dryRun) {
      const targetPath = filePath || folderPath;
      const exists = fs.existsSync(targetPath);
      const stats = exists ? fs.statSync(targetPath) : null;
      
      let files: string[] = [];
      if (exists && stats?.isDirectory()) {
        files = fs.readdirSync(targetPath)
          .map(f => path.join(targetPath, f))
          .filter(f => fs.statSync(f).isFile());
      } else if (exists && stats?.isFile()) {
        files = [targetPath];
      }

      return NextResponse.json({
        dryRun: true,
        exists,
        isDirectory: stats?.isDirectory() || false,
        filesFound: files.length,
        files: files.map(f => path.basename(f)),
      });
    }

    // Limpiar datos existentes si se solicita
    if (clearExisting) {
      await clearClientData(clientId);
    }

    // Procesar según el tipo de entrada
    let result;
    if (filePath) {
      result = await ingestSingleFile(clientId, filePath);
      return NextResponse.json({
        success: result.success,
        filesProcessed: result.success ? 1 : 0,
        totalChunks: result.chunks,
        errors: result.error ? [{ file: path.basename(filePath), error: result.error }] : [],
        details: result.success ? [{
          file: path.basename(filePath),
          chunks: result.chunks,
          fileType: path.extname(filePath),
        }] : [],
      });
    } else if (folderPath) {
      result = await ingestDirectory(clientId, folderPath);
      return NextResponse.json(result);
    }

  } catch (error) {
    console.error('Error en ingest:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/rag/ingest?clientId=xxx
 * Obtiene estadísticas de ingestión
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId es requerido' },
        { status: 400 }
      );
    }

    const stats = await getIngestStats(clientId);
    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error obteniendo stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rag/ingest
 * Elimina todos los datos de un cliente
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId es requerido' },
        { status: 400 }
      );
    }

    await clearClientData(clientId);
    
    return NextResponse.json({
      success: true,
      message: `Datos del cliente ${clientId} eliminados correctamente`,
    });

  } catch (error) {
    console.error('Error eliminando datos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
