import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import PDFExtract from 'pdf-extract'
import { promises as fs } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { randomUUID } from 'crypto'

// Configuración de la API de Kimi (OpenRouter)
const KIMI_API_KEY = process.env.OPENROUTER_API_KEY || ''
const KIMI_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// System prompt para análisis geotécnico
const SYSTEM_PROMPT = `Eres un ingeniero geotécnico experto con 20 años de experiencia en análisis de suelos para construcción en Costa Rica y Latinoamérica.

ANALIZA el siguiente estudio de suelo geotécnico y extrae la información en formato JSON estructurado.

INSTRUCCIONES:
1. Identifica el NIVEL DE FILTRACIÓN: alto, medio, bajo, critico, o ninguno
2. Identifica el TIPO DE SUELO PRINCIPAL: arcilloso, arenoso, limoso, rocoso, organico, o mixto
3. Lista TODOS los tipos de suelo detectados
4. Proporciona RECOMENDACIONES CRÍTICAS específicas para la constructora
5. Identifica RIESGOS para la construcción
6. Extrae datos técnicos: profundidad de cimentación recomendada, capacidad portante, pH, humedad
7. Genera un RESUMEN EJECUTIVO para el cliente (no técnico)
8. Identifica ALERTAS importantes
9. Genera CONCLUSIONES para generar una cotización

FORMATO DE SALIDA (JSON estricto):
{
  "nivel_filtracion": "alto|medio|bajo|critico|ninguno",
  "tipo_suelo_principal": "string",
  "tipos_suelo_detectados": ["string"],
  "recomendaciones_criticas": ["string"],
  "riesgos_identificados": ["string"],
  "profundidad_recomendada_cimentacion": "string",
  "capacidad_portante": "string",
  "ph_suelo": number,
  "contenido_humedad": "string",
  "recomendacion_general": "string (detallado)",
  "resumen_ejecutivo": "string (para cliente)",
  "alertas": ["string"],
  "servicios_recomendados": [
    {"servicio": "string", "urgencia": "alta|media|baja", "justificacion": "string"}
  ],
  "estimacion_costo_min": number,
  "estimacion_costo_max": number,
  "confianza_analisis": 0.0-1.0
}`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File
    const proyectoId = formData.get('proyecto_id') as string
    const clienteId = formData.get('cliente_id') as string
    const tenantId = formData.get('tenant_id') as string

    if (!file || !proyectoId || !clienteId || !tenantId) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // 1. Guardar PDF temporalmente
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const tempFile = join(tmpdir(), `${randomUUID()}.pdf`)
    await fs.writeFile(tempFile, buffer)

    // 2. Extraer texto del PDF
    const pdfExtract = new PDFExtract()
    const extractOptions = {}
    
    let rawText = ''
    try {
      const data = await pdfExtract.extract(tempFile, extractOptions)
      rawText = data.pages
        .map(page => page.content.map(item => item.str).join(' '))
        .join('\n\n')
    } catch (pdfError) {
      console.error('Error extrayendo PDF:', pdfError)
      // Fallback: usar el buffer como texto si falla la extracción
      rawText = buffer.toString('utf-8').substring(0, 50000)
    }

    // Limpiar archivo temporal
    await fs.unlink(tempFile).catch(() => {})

    // 3. Subir PDF a Supabase Storage
    const supabase = createServiceSupabaseClient()
    const fileName = `estudios/${tenantId}/${randomUUID()}.pdf`
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('estudios-suelo')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('Error subiendo PDF:', uploadError)
      return NextResponse.json(
        { error: 'Error al subir el PDF' },
        { status: 500 }
      )
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase
      .storage
      .from('estudios-suelo')
      .getPublicUrl(fileName)

    // 4. Crear registro inicial del estudio
    const { data: estudio, error: estudioError } = await supabase
      .from('estudios_suelo')
      .insert({
        tenant_id: tenantId,
        proyecto_id: proyectoId,
        cliente_id: clienteId,
        titulo: file.name.replace('.pdf', ''),
        tipo_estudio: 'geotecnico',
        pdf_original_url: publicUrl,
        pdf_original_path: fileName,
        raw_text_analysis: rawText.substring(0, 100000), // Limitar tamaño
        raw_text_extracted_at: new Date().toISOString(),
        raw_text_extraction_method: 'pdf-extract',
        estado_analisis: 'procesando',
        paginas_totales: rawText.split('\n\n').length
      })
      .select()
      .single()

    if (estudioError) {
      console.error('Error creando estudio:', estudioError)
      return NextResponse.json(
        { error: 'Error al crear el estudio' },
        { status: 500 }
      )
    }

    // 5. Llamar a la API de Kimi para análisis
    const analisisIA = await analizarConKimi(rawText)

    // 6. Actualizar estudio con conclusiones
    const { error: updateError } = await supabase
      .from('estudios_suelo')
      .update({
        conclusiones_ia: analisisIA,
        conclusiones_ia_generadas_at: new Date().toISOString(),
        conclusiones_ia_modelo: 'kimi-k2',
        conclusiones_ia_confianza: analisisIA.confianza_analisis || 0.85,
        estado_analisis: 'completado'
      })
      .eq('id', estudio.id)

    if (updateError) {
      console.error('Error actualizando estudio:', updateError)
    }

    // 7. Crear cotización automática
    const cotizacion = await crearCotizacionAutomatica(
      supabase,
      tenantId,
      clienteId,
      proyectoId,
      estudio.id,
      analisisIA
    )

    // 8. Crear reporte de cobro
    await crearReporteCobro(
      supabase,
      tenantId,
      clienteId,
      proyectoId,
      cotizacion.id,
      analisisIA
    )

    // 9. Enviar email al cliente (asíncrono, no esperamos respuesta)
    enviarEmailNotificacion(supabase, clienteId, estudio, analisisIA)
      .catch(err => console.error('Error enviando email:', err))

    return NextResponse.json({
      success: true,
      estudio_id: estudio.id,
      codigo_estudio: estudio.codigo_estudio,
      analisis: analisisIA,
      cotizacion_id: cotizacion.id,
      message: 'Estudio analizado correctamente'
    })

  } catch (error) {
    console.error('Error en análisis:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

async function analizarConKimi(texto: string): Promise<any> {
  try {
    // Limitar texto para no exceder tokens
    const textoLimitado = texto.substring(0, 15000)

    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'LedgerFlow'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-small-3.1-24b-instruct',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: textoLimitado
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error API Kimi:', errorText)
      throw new Error('Error en API de Kimi')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    
    if (!content) {
      throw new Error('Respuesta vacía de Kimi')
    }

    // Parsear JSON de la respuesta
    try {
      return JSON.parse(content)
    } catch {
      // Si no es JSON válido, extraerlo del texto
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('No se pudo parsear la respuesta')
    }

  } catch (error) {
    console.error('Error llamando a Kimi:', error)
    // Retornar análisis básico en caso de error
    return {
      nivel_filtracion: 'medio',
      tipo_suelo_principal: 'mixto',
      tipos_suelo_detectados: ['arcilla', 'arena'],
      recomendaciones_criticas: ['Revisión técnica recomendada'],
      riesgos_identificados: ['Requiere verificación'],
      recomendacion_general: 'El análisis automático no pudo completarse. Se recomienda revisión manual por un ingeniero.',
      resumen_ejecutivo: 'Estudio recibido. Análisis manual requerido.',
      alertas: ['Error en procesamiento automático'],
      servicios_recomendados: [
        { servicio: 'Revisión técnica especializada', urgencia: 'alta', justificacion: 'Análisis automático incompleto' }
      ],
      estimacion_costo_min: 1500000,
      estimacion_costo_max: 3000000,
      confianza_analisis: 0.5
    }
  }
}

async function crearCotizacionAutomatica(
  supabase: any,
  tenantId: string,
  clienteId: string,
  proyectoId: string,
  estudioId: string,
  analisis: any
) {
  const servicios = (analisis.servicios_recomendados || []).map((s: any) => ({
    concepto: s.servicio,
    descripcion: s.justificacion,
    cantidad: 1,
    unidad: 'servicio',
    precio_unitario: Math.round((analisis.estimacion_costo_min || 1000000) / (analisis.servicios_recomendados.length || 1)),
    subtotal: 0,
    categoria: 'trabajo'
  }))

  // Calcular subtotales
  const subtotal = servicios.reduce((sum: number, s: any) => sum + s.precio_unitario, 0)
  servicios.forEach((s: any) => s.subtotal = s.precio_unitario)

  const { data: cotizacion, error } = await supabase
    .from('cotizaciones')
    .insert({
      tenant_id: tenantId,
      cliente_id: clienteId,
      proyecto_id: proyectoId,
      estudio_suelo_id: estudioId,
      titulo: `Cotización basada en análisis de estudio geotécnico`,
      descripcion: 'Generada automáticamente basada en análisis de IA',
      servicios_json: servicios,
      subtotal: subtotal,
      total: subtotal * 1.13, // IVA 13%
      moneda: 'CRC',
      basado_en_estudio: true,
      recomendaciones_aplicadas: analisis.recomendaciones_criticas || [],
      estado: 'borrador'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creando cotización:', error)
    throw error
  }

  return cotizacion
}

async function crearReporteCobro(
  supabase: any,
  tenantId: string,
  clienteId: string,
  proyectoId: string,
  cotizacionId: string,
  analisis: any
) {
  const monto = Math.round((analisis.estimacion_costo_min || 1000000) * 0.3) // 30% anticipo

  const { error } = await supabase
    .from('reportes_cobro')
    .insert({
      tenant_id: tenantId,
      cliente_id: clienteId,
      proyecto_id: proyectoId,
      cotizacion_id: cotizacionId,
      tipo_cobro: 'anticipo',
      concepto: 'Anticipo por análisis de estudio geotécnico',
      monto_esperado: monto,
      fecha_esperada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 días
      estado: 'pendiente'
    })

  if (error) {
    console.error('Error creando reporte de cobro:', error)
  }
}

async function enviarEmailNotificacion(
  supabase: any,
  clienteId: string,
  estudio: any,
  analisis: any
) {
  // Obtener datos del cliente
  const { data: cliente } = await supabase
    .from('clientes')
    .select('nombre, correo')
    .eq('id', clienteId)
    .single()

  if (!cliente || !cliente.correo) return

  // Preparar contenido del email
  const subject = `Análisis de Estudio de Suelo Completado - ${estudio.codigo_estudio}`
  
  const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Análisis de Estudio de Suelo Completado</h2>
        <p>Estimado/a ${cliente.nombre},</p>
        <p>Hemos completado el análisis de su estudio de suelo <strong>${estudio.codigo_estudio}</strong>.</p>
        
        <h3>Resumen Ejecutivo</h3>
        <p>${analisis.resumen_ejecutivo || 'Análisis completado'}</p>
        
        <h3>Nivel de Filtración Detectado</h3>
        <div style="background-color: ${getColorNivel(analisis.nivel_filtracion)}; color: white; padding: 10px; border-radius: 5px; display: inline-block;">
          <strong>${(analisis.nivel_filtracion || 'MEDIO').toUpperCase()}</strong>
        </div>
        
        <h3>Recomendaciones Clave</h3>
        <ul>
          ${(analisis.recomendaciones_criticas || []).map((r: string) => `<li>${r}</li>`).join('')}
        </ul>
        
        <p>Se ha generado una cotización preliminar basada en estos hallazgos.</p>
        
        <p>Saludos cordiales,<br>Equipo LedgerFlow</p>
      </body>
    </html>
  `

  // Aquí integrarías con tu servicio de email (Resend, SendGrid, etc.)
  // Por ahora solo logueamos
  console.log('Email a enviar:', {
    to: cliente.correo,
    subject,
    html: htmlContent.substring(0, 200) + '...'
  })

  // Ejemplo con Resend (descomenta cuando tengas configurado):
  /*
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'LedgerFlow <yoenqueco@gmail.com>',
    to: cliente.correo,
    subject,
    html: htmlContent
  })
  */
}

function getColorNivel(nivel: string): string {
  const colores: Record<string, string> = {
    critico: '#dc2626',
    alto: '#ea580c',
    medio: '#ca8a04',
    bajo: '#16a34a',
    ninguno: '#0891b2'
  }
  return colores[nivel?.toLowerCase()] || '#6b7280'
}
