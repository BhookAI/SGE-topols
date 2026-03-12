# Configuración de n8n para LedgerFlow

## Instalación Local (Docker)

```bash
# docker-compose.yml
version: '3'

services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=tu-password-segura
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - WEBHOOK_URL=http://localhost:5678/
      - DB_TYPE=sqlite
    volumes:
      - ~/.n8n:/home/node/.n8n
```

```bash
# Iniciar n8n
docker-compose up -d

# Acceder a http://localhost:5678
```

## Workflows Principales

### 1. Document Processor (Procesamiento de Facturas)

**Trigger:** Webhook desde Supabase (documento subido)

**Pasos:**
1. Recibir webhook con datos del documento
2. Descargar archivo desde Supabase Storage
3. Preprocesar según tipo (PDF → imagen, Excel → parse)
4. Llamar a OpenAI Vision con prompt de extracción
5. Validar datos extraídos (matemáticas, schema)
6. Guardar en tabla documents (extracted_data)
7. Crear transacción automática si es factura válida
8. Notificar al cliente vía webhook

**Configuración OpenAI:**
- Model: gpt-4o-mini (económico) o gpt-4o (preciso)
- Temperature: 0.1 (precisión sobre creatividad)
- Max tokens: 2000

### 2. Email Monitor (Monitoreo de Correos)

**Trigger:** IMAP cada 5 minutos

**Pasos:**
1. Conectar a buzón IMAP del tenant
2. Leer correos no leídos
3. Clasificar con IA (invoice/project/inquiry)
4. Extraer entidades (montos, fechas, adjuntos)
5. Si tiene adjunto → descargar y procesar
6. Crear actividad en dashboard
7. Marcar como leído o mover a carpeta procesados

### 3. Weekly Reporter (Reportes Automáticos)

**Trigger:** Schedule (Lunes 9:00 AM)

**Pasos:**
1. Obtener tenants activos
2. Por cada tenant:
   - Calcular métricas de la semana
   - Generar gráficas (si es posible)
   - Crear resumen en texto
3. Enviar WhatsApp/email a cada cliente
4. Registrar envío en activities

### 4. Project Health Monitor

**Trigger:** Schedule (Diario 8:00 AM)

**Pasos:**
1. Obtener proyectos activos
2. Calcular métricas:
   - % completado vs tiempo transcurrido
   - Budget usado vs presupuestado
   - Tareas atrasadas
3. Detectar anomalías (riesgos)
4. Generar alertas si hay problemas
5. Notificar a managers

## Variables de Entorno en n8n

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
OPENROUTER_API_KEY=xxx
WHATSAPP_API_KEY=xxx
RESEND_API_KEY=xxx
WEBHOOK_SECRET=xxx
```

## Webhooks desde Supabase

Configurar en Supabase Dashboard → Database → Webhooks:

```sql
-- Trigger para documentos nuevos
CREATE TRIGGER document_uploaded
AFTER INSERT ON documents
FOR EACH ROW
EXECUTE FUNCTION http_post(
  'https://n8n.tu-dominio.com/webhook/document-uploaded',
  'application/json',
  jsonb_build_object(
    'document_id', NEW.id,
    'tenant_id', NEW.tenant_id,
    'file_url', NEW.storage_url,
    'file_type', NEW.file_type
  )
);
```

## Testing

```bash
# Probar webhook de documento
curl -X POST http://localhost:5678/webhook/document-uploaded \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "test-id",
    "tenant_id": "test-tenant",
    "file_url": "https://example.com/test.pdf",
    "file_type": "application/pdf"
  }'
```

## Costos Estimados

- n8n self-hosted: $5-10/mes (VPS)
- OpenAI Vision: $0.005-0.015 por imagen
- ~1000 documentos/mes: $5-15
- Total: ~$10-25/mes
