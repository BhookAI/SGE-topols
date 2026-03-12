import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

// Webhook para recibir resultados del procesamiento IA desde n8n
export async function POST(request: Request) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.N8N_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { document_id, extracted_data, document_type, confidence, raw_text } = body

    if (!document_id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    const supabase = createServiceSupabaseClient()

    // Update document with extracted data
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        status: confidence && confidence > 0.7 ? 'processed' : 'processing',
        document_type,
        extracted_data,
        confidence,
        raw_text,
        processed_at: new Date().toISOString(),
      })
      .eq('id', document_id)

    if (updateError) throw updateError

    // If it's an invoice/receipt, create transaction
    if (document_type === 'invoice' || document_type === 'receipt') {
      const { data: document } = await supabase
        .from('documents')
        .select('tenant_id, client_id, project_id')
        .eq('id', document_id)
        .single()

      if (document && extracted_data?.total) {
        await supabase.from('transactions').insert({
          tenant_id: document.tenant_id,
          project_id: document.project_id,
          document_id,
          client_id: document.client_id,
          type: 'expense',
          amount: extracted_data.total,
          currency: extracted_data.currency || 'EUR',
          amount_eur: extracted_data.total,
          date: extracted_data.date || new Date().toISOString().split('T')[0],
          description: extracted_data.vendor_name 
            ? `Compra en ${extracted_data.vendor_name}`
            : 'Transacción desde documento',
          vendor_name: extracted_data.vendor_name,
          vendor_tax_id: extracted_data.tax_id,
          invoice_number: extracted_data.invoice_number,
          source: 'upload',
        })
      }
    }

    // Create activity
    const { data: document } = await supabase
      .from('documents')
      .select('tenant_id, file_name')
      .eq('id', document_id)
      .single()

    if (document) {
      await supabase.from('activities').insert({
        tenant_id: document.tenant_id,
        document_id,
        type: 'document_processed',
        title: 'Documento procesado',
        description: `"${document.file_name}" ha sido procesado por IA`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}
