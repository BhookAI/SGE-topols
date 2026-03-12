import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel', // xls
]

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'xlsx', 'xls']

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabaseAuth.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceSupabaseClient()

    // Get user's tenant
    const { data: user } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', session.user.id)
      .single()

    const tenantId = user?.tenant_id ?? session.user.user_metadata?.tenant_id
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Security: Validate File Type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
       return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
       return NextResponse.json({ error: 'File extension not allowed' }, { status: 400 })
    }

    // Security: Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
       return NextResponse.json({ error: 'File size exceeds limit of 10MB' }, { status: 400 })
    }

    // Generate unique filename
    const fileName = `${nanoid()}.${fileExt}`
    const filePath = `${tenantId}/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    // Create document record
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        tenant_id: tenantId,
        file_name: file.name,
        file_type: fileExt,
        file_size: file.size,
        mime_type: file.type,
        storage_path: filePath,
        storage_url: publicUrl,
        status: 'processing',
        uploaded_by: session.user.id,
      })
      .select()
      .single()

    if (dbError) throw dbError

    // Trigger webhook for AI processing (async)
    if (process.env.N8N_WEBHOOK_URL) {
      fetch(process.env.N8N_WEBHOOK_URL + '/document-uploaded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: document.id,
          tenant_id: tenantId,
          file_url: publicUrl,
          file_type: file.type,
        }),
      }).catch(console.error)
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}
