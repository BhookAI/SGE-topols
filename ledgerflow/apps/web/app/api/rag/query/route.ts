import { NextRequest, NextResponse } from 'next/server';
import { queryDocuments, queryTransactions, extractTransactionsFromDocuments, generateExecutiveSummary } from '@/lib/rag';

/**
 * POST /api/rag/query
 * Realiza consultas RAG sobre documentos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      clientId, 
      query, 
      type = 'general',
      topK = 5,
      conversationHistory = []
    } = body;

    if (!clientId || !query) {
      return NextResponse.json(
        { error: 'clientId y query son requeridos' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'transactions':
        result = await queryTransactions(clientId, query);
        break;
      
      case 'general':
      default:
        result = await queryDocuments(clientId, query, topK);
        break;
    }

    return NextResponse.json({
      success: true,
      query,
      type,
      ...result,
    });

  } catch (error) {
    console.error('Error en query:', error);
    return NextResponse.json(
      { error: 'Error procesando la consulta', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/rag/query/transactions?clientId=xxx
 * Extrae transacciones de documentos
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const action = searchParams.get('action') || 'transactions';

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId es requerido' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'transactions':
        const transactions = await extractTransactionsFromDocuments(clientId);
        return NextResponse.json({
          success: true,
          count: transactions.length,
          transactions,
        });

      case 'summary':
        const summary = await generateExecutiveSummary(clientId);
        return NextResponse.json({
          success: true,
          summary,
        });

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error en GET query:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
