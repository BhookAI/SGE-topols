# 🏗️ LEDGERFLOW PRO - Sistema de Gestión Geotécnica

## 📋 Resumen de Implementación

### Tarea 1: Estructura de Datos ✅

**Archivo creado:** `packages/database/schema_geotecnia.sql`

#### Tablas Implementadas:

1. **clientes**
   - Datos de contacto y empresa
   - Saldo pendiente y crédito
   - Clasificación por tipo y prioridad
   - Historial de comunicaciones

2. **proyectos**
   - Vinculación cliente-proyecto
   - Estados de flujo de trabajo
   - Presupuestos y costos
   - Fechas de entrega

3. **estudios_suelo**
   - Almacenamiento de PDFs
   - Texto extraído (raw_text_analysis)
   - Análisis de IA (conclusiones_ia JSONB)
   - Vector embeddings para búsqueda semántica
   - Visualización de datos (heatmap, capas)

4. **cotizaciones**
   - Servicios en formato JSON flexible
   - Desglose financiero completo
   - Estados de aprobación
   - Generación de PDFs

5. **reportes_cobro**
   - Seguimiento de pagos
   - Alertas por mora
   - Recordatorios automáticos
   - Acciones de cobranza

6. **workflow_logs**
   - Auditoría de ejecuciones n8n
   - Tracking de procesos
   - Manejo de errores

#### Funcionalidades Avanzadas:
- ✅ Triggers automáticos para códigos (EST-2025-0001, COT-2025-0001)
- ✅ Cálculo automático de totales en cotizaciones
- ✅ Actualización automática de saldos de clientes
- ✅ Índices optimizados para búsquedas
- ✅ Vistas para dashboard (cobros, pipeline)
- ✅ RLS (Row Level Security) para multi-tenancy

---

### Tarea 2: Workflow n8n ✅

**Archivo creado:** `n8n-workflows/analisis-estudio-suelo.json`

#### Flujo de Trabajo:

```
Webhook Trigger
    ↓
Obtener Estudio (Supabase)
    ↓
Descargar PDF (Supabase Storage)
    ↓
Extraer Texto (n8n PDF node)
    ↓
IA Análisis (Kimi API)
    ↓
Actualizar Estudio (Guardar resultados)
    ↓
¿Nivel Crítico? (Condicional)
    ├─ SI → Crear Cotización
    └─ NO → Continuar
    ↓
Obtener Cliente
    ↓
├─ Enviar Email (Notificación)
└─ Crear Reporte Cobro
    ↓
Log Éxito
    ↓
Responder Webhook
```

#### Características:
- **Trigger:** Webhook `/webhook/analisis-suelo`
- **IA:** Análisis geotécnico con Kimi K2
- **Prompt:** Especializado en ingeniería geotécnica
- **Output:** JSON estructurado con conclusiones
- **Automatización:** Email + Cotización + Cobro

---

### Tarea 3: Componentes Frontend

**Stack:** Next.js 14 + TypeScript + Tailwind + shadcn/ui

#### Dashboard Sugerido:

```
┌─────────────────────────────────────────────────────────┐
│  📊 DASHBOARD GESTIÓN GEOTÉCNICA                        │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │💰 Cobros │ │📁 Estudios│ │📋 Cotiz. │ │👥 Clientes│   │
│  │Pendientes│ │Pendientes│ │Aprobadas │ │Activos   │   │
│  │ ₡25M    │ │    12    │ │    8     │ │   45    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├─────────────────────────────────────────────────────────┤
│  🚨 ALERTAS DE COBRO                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🔴 Crítica: Constructora ABC - ₡3.5M (45 días) │   │
│  │ 🟠 Alta: Arquitectos XYZ - ₡1.2M (20 días)     │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  📍 MAPA DE PROYECTOS                                   │
│  [Visualización geográfica de obras activas]           │
├─────────────────────────────────────────────────────────┤
│  🗺️ PANORAMA VISIBLE DEL SUELO (Visualización IA)     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [Heatmap de filtraciones]                      │   │
│  │  [Capas de suelo interactivas]                  │   │
│  │  [Zonas de riesgo marcadas]                     │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  📈 PIPELINE DE PROYECTOS                               │
│  Pendiente → En Estudio → Cotización → Aprobado        │
│  [Gráfico de flujo con cantidades]                     │
└─────────────────────────────────────────────────────────┘
```

#### Componentes Clave:

1. **PanelVisualSuelo**
   - Heatmap de filtraciones
   - Capas de suelo 3D
   - Marcadores de riesgo
   - Leyenda interactiva

2. **AlertasCobro**
   - Colores por nivel de alerta
   - Acciones rápidas (email, llamada)
   - Historial de contactos

3. **PipelineProyectos**
   - Kanban de estados
   - Arrastrar y soltar
   - Métricas por etapa

4. **AnalizadorPDF**
   - Upload de estudios
   - Preview del análisis
   - Revisión antes de enviar

---

## 🚀 Instrucciones de Deploy

### 1. Base de Datos
```bash
cd /home/hael/Imagenes/SGE/ledgerflow
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f packages/database/schema_geotecnia.sql
```

### 2. n8n Workflow
1. Abrir n8n: http://localhost:5678
2. Importar: `n8n-workflows/analisis-estudio-suelo.json`
3. Configurar credenciales:
   - Supabase: URL + Service Role Key
   - Kimi API: Bearer token
   - Resend SMTP: API Key

### 3. Storage Bucket (Supabase)
```sql
-- Crear bucket para estudios
INSERT INTO storage.buckets (id, name, public) 
VALUES ('estudios-suelo', 'estudios-suelo', false);

-- Políticas de acceso
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'estudios-suelo');
```

### 4. Variables de Entorno
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://esouimxqetamqbolaaie.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# n8n Webhook
N8N_WEBHOOK_URL=http://localhost:5678/webhook/
N8N_SECRET=...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=yoenqueco@gmail.com
```

### 5. Túneles Cloudflare
```bash
# Verificar túneles activos
cloudflared tunnel list

# El sistema ya está expuesto en:
# - App: https://ledgerflow.tudominio.com
# - n8n: https://n8n.tudominio.com
# - Supabase: https://db.tudominio.com
```

---

## 📡 Acceso Local

| Servicio | URL Local | Túnel Cloudflare |
|----------|-----------|------------------|
| LedgerFlow App | http://localhost:3000 | https://tu-subdominio.cloudflare... |
| n8n | http://localhost:5678 | Configurar en NPM |
| Supabase API | http://localhost:54321 | - |
| Supabase Studio | http://localhost:54323 | - |

---

## 🔄 Flujo de Trabajo Completo

1. **La profesional** sube un estudio de suelo PDF
2. **Trigger automático** (webhook o DB insert)
3. **n8n** descarga el PDF y extrae el texto
4. **IA (Kimi)** analiza el contenido geotécnico
5. **Resultados guardados** en Supabase
6. **Si hay filtraciones críticas:**
   - Se genera cotización automática
   - Se crea reporte de cobro
   - Se envía email al cliente
7. **Dashboard actualizado** con panorama visible del suelo

---

## 🛡️ Seguridad Implementada

- ✅ RLS en todas las tablas
- ✅ Service Role Key solo en backend
- ✅ JWT tokens con expiración
- ✅ Sanitización de inputs
- ✅ Auditoría de workflows
- ✅ Acceso por roles (admin, cliente)

---

## 📞 Soporte y Contacto

**Desarrollador:** Vex (OpenClaw)
**Usuario:** Axel/Hael
**Fecha:** 2026-03-10

Para actualizaciones o problemas, revisar:
- Logs de n8n: http://localhost:5678/executions
- Logs de Supabase: `docker logs supabase-db`
- Documentación: `/home/hael/Imagenes/SGE/ledgerflow/docs/`
