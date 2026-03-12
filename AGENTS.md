# LEDGERFLOW - SaaS de Gestión Empresarial Inteligente

## Especificación Técnica para Kimi Code

**Versión:** 1.0  
**Fecha:** 2026-03-03  
**Filosofía:** No-code first, Visual first, Cost-optimized  
**Stack:** Supabase + Next.js + n8n + AI APIs (OpenRouter/Groq para costos bajos)

---

## 1. VISIÓN GENERAL

### Concepto Central
SaaS B2B multi-tenant que combina:
- **Contabilidad automatizada** - Procesamiento de facturas/documentos con IA
- **Gestión de proyectos** - Kanban, timeline, tracking de horas
- **Agente de correos** - Extracción de datos de emails, respuestas automáticas
- **Dashboards analíticos** - Visualización de datos por cliente
- **Comunicación proactiva** - Notificaciones WhatsApp/email automáticas

### Diferenciador Clave
- **Zero-config para clientes:** Solo nombre + contacto, códigos de invitación
- **Procesamiento universal:** Acepta CUALQUIER formato (PDF, IMG, Excel, CSV, HTML)
- **Dark mode by default:** Interfaz premium tipo "glassmorphism"
- **Acceso por códigos:** Sin passwords complejos, ej: `ACME-2024-X7K`

---

## 2. ARQUITECTURA ECONÓMICA (Stack Barato)

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js 14) - Vercel Hobby Tier                  │
│  ▼ Costo: $0                                                │
├─────────────────────────────────────────────────────────────┤
│  SUPABASE (Free Tier → Pro $25/mes en escala)              │
│  ├─ PostgreSQL (500MB → 8GB)                               │
│  ├─ Auth (custom con códigos)                              │
│  ├─ Storage (1GB documentos)                               │
│  ├─ Edge Functions (500k reqs/mes)                         │
│  └─ Realtime (websockets)                                  │
│  ▼ Costo: $0 → $25/mes                                     │
├─────────────────────────────────────────────────────────────┤
│  n8n (Self-hosted en Railway)                               │
│  ├─ 1 contenedor $5/mes                                    │
│  ├─ Webhooks ilimitados                                    │
│  └─ ~10k ejecuciones/mes                                   │
│  ▼ Costo: $5/mes                                           │
├─────────────────────────────────────────────────────────────┤
│  IA (OpenRouter/Groq - alternativa barata a OpenAI)        │
│  ├─ Mixtral 8x7B: $0.27/M tokens                           │
│  ├─ Llama 3.1 70B: $0.59/M tokens                          │
│  ├─ Vision: $0.005/imagen                                  │
│  └─ Embeddings: transformers.js local                      │
│  ▼ Costo: ~$10-20/mes uso moderado                         │
└─────────────────────────────────────────────────────────────┘
TOTAL MVP: ~$15-30/mes
```

---

## 3. DISEÑO UI/UX - TEMA OSCURO

### Paleta de Colores (Dark Mode Only)

```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0a0f;        /* Principal muy oscuro */
  --bg-secondary: #12121a;      /* Cards, sidebars */
  --bg-tertiary: #1a1a25;       /* Hover, inputs */
  --bg-elevated: #222230;       /* Modales, dropdowns */
  
  /* Accents - Gradiente dinámico */
  --accent-primary: #6366f1;    /* Indigo */
  --accent-secondary: #8b5cf6;  /* Violet */
  --accent-tertiary: #06b6d4;   /* Cyan */
  --accent-gradient: linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4);
  
  /* Estados */
  --success: #10b981;           /* Verde esmeralda */
  --warning: #f59e0b;           /* Ámbar */
  --error: #ef4444;             /* Rojo */
  --info: #3b82f6;              /* Azul */
  
  /* Texto */
  --text-primary: #f8fafc;      /* Casi blanco */
  --text-secondary: #94a3b8;    /* Gris azulado */
  --text-muted: #64748b;        /* Gris medio */
  
  /* Bordes */
  --border: rgba(255,255,255,0.08);
  --border-hover: rgba(255,255,255,0.15);
}
```

### Componentes Visuales Clave

```css
/* Glassmorphism Cards */
.glass-card {
  background: rgba(18, 18, 26, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

/* Gradient Border (elementos activos) */
.gradient-border {
  position: relative;
  background: var(--bg-secondary);
  border-radius: 12px;
}
.gradient-border::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 13px;
  background: var(--accent-gradient);
  z-index: -1;
}
```

---

## 4. BASE DE DATOS (SUPABASE)

### Schema Principal

```sql
-- TENANTS (Empresas/Agencias que usan el SaaS)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    invitation_code VARCHAR(20) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    plan VARCHAR(20) DEFAULT 'free',
    max_clients INT DEFAULT 5,
    max_projects INT DEFAULT 3,
    max_storage_mb INT DEFAULT 1000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USERS (Admins y empleados del tenant)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'member',
    full_name VARCHAR(255),
    avatar_url TEXT,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- CLIENTS (Clientes externos, acceden por código)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    access_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company_name VARCHAR(255),
    preferences JSONB DEFAULT '{"notifications": true, "language": "es"}',
    last_access TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- PROJECTS
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning',
    budget DECIMAL(12,2),
    spent DECIMAL(12,2) DEFAULT 0,
    progress INT DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DOCUMENTS (Facturas, recibos, archivos)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    file_name VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INT NOT NULL,
    storage_path TEXT NOT NULL,
    storage_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'processing',
    extracted_data JSONB,
    document_type VARCHAR(50),
    confidence DECIMAL(3,2),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSACTIONS (Contabilidad)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    date DATE NOT NULL,
    description TEXT,
    vendor_name VARCHAR(255),
    vendor_tax_id VARCHAR(50),
    is_reconciled BOOLEAN DEFAULT false,
    source VARCHAR(50) DEFAULT 'manual',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITIES (Timeline de eventos)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES (Comunicación agente-cliente)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL,
    sender_id UUID,
    channel VARCHAR(20) DEFAULT 'dashboard',
    content TEXT NOT NULL,
    attachments JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Políticas RLS (Row Level Security)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Tenants: Solo ven su propio tenant
CREATE POLICY tenant_isolation ON tenants
    FOR ALL USING (id = current_setting('app.current_tenant')::UUID);

-- Users: Solo usuarios del tenant actual
CREATE POLICY user_isolation ON users
    FOR ALL USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Clients: Aislados por tenant
CREATE POLICY client_isolation ON clients
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant')::UUID
        OR id = current_setting('app.current_client')::UUID
    );

-- Projects: Tenant isolation
CREATE POLICY project_isolation ON projects
    FOR ALL USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Documents: Tenant isolation + acceso por client_id
CREATE POLICY document_isolation ON documents
    FOR ALL USING (
        tenant_id = current_setting('app.current_tenant')::UUID
        OR client_id = current_setting('app.current_client')::UUID
    );

-- Función para setear contexto de tenant
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant', tenant_id::text, false);
END;
$$ LANGUAGE plpgsql;
```

---

## 5. SISTEMA DE ACCESO (CÓDIGOS DE INVITACIÓN)

### Flujo de Acceso Cliente

1. **Cliente recibe código** (ej: `#PROJ-2024-X7`)
2. **Ingresa en landing page** `/access`
3. **Validación de código** → Verifica en DB
4. **Si válido:** Formulario mínimo (Nombre + Email + Tel)
5. **Crear/recuperar perfil** → Dashboard personal
6. **Acceso permanente** por cookie/localStorage

### Generación de Códigos

```typescript
// utils/codes.ts
export function generateAccessCode(tenantSlug: string, projectId?: string): string {
  const prefix = tenantSlug.substring(0, 4).toUpperCase();
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  const project = projectId ? `-${projectId.slice(0, 3)}` : '';
  return `${prefix}${project}-${year}-${random}`;
}

// Ejemplos:
// ACME-2024-X7K (cliente general)
// ACME-a8f-2024-K2M (cliente de proyecto específico)
```

---

## 6. AGENTES DE IA & AUTOMATIZACIÓN

### Arquitectura de Agentes

```
┌─────────────────────────────────────────────────────────────┐
│                    ORQUESTADOR (n8n)                        │
│  - Recibe webhooks de Supabase                              │
│  - Enruta a agentes especializados                          │
│  - Gestiona colas y rate limiting                           │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ AGENTE DOC   │    │ AGENTE COMMS    │    │ AGENTE ANALYSIS │
│ (Documentos) │    │ (Comunicación)  │    │ (Reportes)      │
└──────────────┘    └─────────────────┘    └─────────────────┘
        │                     │                     │
   [OpenAI Vision]      [WhatsApp API]        [GPT-4 + DB]
   [OCR Tesseract]      [Resend Email]        [Anomaly detect]
   [Local LLM]          [SMS Gateway]         [Charts]
```

### Agente 1: Procesador de Documentos (DOC-AGENT)

**Trigger:** Webhook desde Supabase cuando `documents.status = 'processing'`

**Prompt del Sistema:**
```
Eres un contador experto especializado en extracción de datos financieros.
Analiza el documento y extrae información en JSON estricto.

REGLAS:
1. Factura: emisor, NIF/CIF, fecha, número, base imponible, IVA, total, líneas
2. Recibo: beneficiario, fecha, importe, concepto
3. Desconocido: marca como 'other', extrae texto relevante
4. Confidence score 0-1 basado en claridad
5. Detecta moneda (EUR, USD, GBP), convierte a EUR
6. Valida cálculos matemáticos

FORMATO JSON (sin markdown):
{
  "document_type": "invoice|receipt|expense|other",
  "confidence": 0.95,
  "extracted_data": {
    "vendor_name": "string",
    "tax_id": "string",
    "date": "YYYY-MM-DD",
    "invoice_number": "string",
    "items": [{"description": "string", "quantity": number, "unit_price": number, "total": number}],
    "subtotal": number,
    "tax_amount": number,
    "total": number,
    "currency": "EUR"
  },
  "raw_text": "texto OCR completo",
  "warnings": ["alertas si hay inconsistencias"]
}
```

### Agente 2: Comunicador (COMMS-AGENT)

**Canales:**
- WhatsApp (primario): Respuestas rápidas, notificaciones
- Email: Reportes detallados, documentos adjuntos
- Dashboard: Mensajes internos

**Ejemplo de flujo:**
```typescript
async function notifyProjectCompletion(projectId: string) {
  const project = await getProject(projectId);
  const client = await getClient(project.client_id);
  
  const message = {
    whatsapp: `🎉 ¡Hola ${client.name}! Tu proyecto "${project.title}" está completado.
                Revisa los entregables aquí: ${project.dashboard_url}`,
    email: {
      subject: `Proyecto completado: ${project.title}`,
      template: 'project_completed',
      data: { project, client, documents: project.documents }
    }
  };
  
  await sendNotification(client, message);
}
```

### Agente 3: Analista (ANALYSIS-AGENT)

**Funciones:**
- Reportes semanales automáticos
- Detección de anomalías en gastos
- Predicción de cash flow
- Sugerencias de optimización

---

## 7. PROCESAMIENTO DE DOCUMENTOS

### Pipeline Universal de Archivos

```
DOCUMENTO (PDF/IMG/CSV/HTML/XLSX)
│
▼ [STORAGE SUPABASE]
│
▼ [n8n TRIGGER: New file]
│
├─► OCR/Parser según tipo
├─► AI Extraction (JSON estructurado)
├─► Validación de datos
└─► Guardar en DB + Notificar
│
▼ [DASHBOARD VISUAL]
├─ Gráficas de gastos/ingresos
├─ Kanban de proyectos
├─ Timeline de actividades
└─ Chat con Agente IA
```

### Soporte de Formatos

| Formato | Método | Librería |
|---------|--------|----------|
| PDF | Rasterización → OCR | pdf2image + Tesseract |
| JPG/PNG/WebP | OCR directo | OpenAI Vision API |
| HEIC (iPhone) | Conversión | libheif-examples |
| XLS/XLSX/CSV | Parser estructural | pandas + openpyxl |
| HTML | Scraping semántico | BeautifulSoup |
| XML (factura-e) | Parser nativo | xml.etree |
| TXT/MD/JSON | Extracción directa | Native |

---

## 8. APIs & ENDPOINTS

### API REST (Next.js App Router)

```
# === AUTENTICACIÓN ===
POST   /api/auth/validate-code          # Validar código de invitación
POST   /api/auth/client-login           # Login cliente (código + datos)
POST   /api/auth/refresh                # Refresh token

# === CLIENTES (Portal público) ===
GET    /api/client/dashboard            # Datos del proyecto
GET    /api/client/documents            # Documentos compartidos
GET    /api/client/activities           # Timeline
POST   /api/client/message              # Enviar mensaje

# === DOCUMENTOS ===
POST   /api/documents/upload            # Subir archivo
POST   /api/documents/process           # Webhook: procesamiento IA
GET    /api/documents/:id               # Obtener documento
PATCH  /api/documents/:id/verify        # Verificar/corregir datos
DELETE /api/documents/:id               # Soft delete

# === PROYECTOS ===
GET    /api/projects                    # Listar con filtros
POST   /api/projects                    # Crear proyecto
GET    /api/projects/:id                # Detalle + stats
PATCH  /api/projects/:id                # Actualizar
DELETE /api/projects/:id                # Archivar
GET    /api/projects/:id/timeline       # Actividades

# === TRANSACCIONES ===
GET    /api/transactions                # Listado con filtros
POST   /api/transactions                # Crear manual
GET    /api/transactions/summary        # Agregados
GET    /api/transactions/cashflow       # Datos para gráficas
```

---

## 9. FLUJOS N8N

### Flujo 1: Procesamiento de Documento

```json
{
  "name": "Document Processor",
  "trigger": {
    "type": "webhook",
    "path": "document-uploaded"
  },
  "nodes": [
    {
      "name": "Download File",
      "type": "httpRequest",
      "url": "={{ $json.body.file_url }}"
    },
    {
      "name": "Preprocess",
      "type": "code",
      "language": "python",
      "code": "# Conversión según tipo de archivo"
    },
    {
      "name": "OpenAI Vision",
      "type": "openAi",
      "model": "gpt-4o-mini",
      "jsonOutput": true
    },
    {
      "name": "Update Document",
      "type": "supabase",
      "operation": "update",
      "table": "documents"
    },
    {
      "name": "Create Transaction",
      "type": "supabase",
      "operation": "insert",
      "table": "transactions"
    },
    {
      "name": "Notify Client",
      "type": "webhook",
      "url": "{{ $json.body.webhook_url }}"
    }
  ]
}
```

### Flujo 2: Reporte Semanal

```json
{
  "name": "Weekly Report Generator",
  "trigger": {
    "type": "schedule",
    "cron": "0 9 * * 1"
  },
  "nodes": [
    {
      "name": "Get Active Tenants",
      "type": "supabase",
      "operation": "select",
      "table": "tenants"
    },
    {
      "name": "Generate Report",
      "type": "code",
      "language": "python"
    },
    {
      "name": "Send WhatsApp",
      "type": "httpRequest",
      "url": "https://api.whatsgw.com.br/send"
    }
  ]
}
```

---

## 10. ESTRUCTURA DE CARPETAS

```
ledgerflow/
├── apps/
│   ├── web/                          # Next.js 14 App Router
│   │   ├── app/
│   │   │   ├── (dashboard)/          # Rutas admin protegidas
│   │   │   │   ├── layout.tsx        # Shell con navegación
│   │   │   │   ├── page.tsx          # Dashboard principal
│   │   │   │   ├── projects/
│   │   │   │   ├── clients/
│   │   │   │   ├── documents/
│   │   │   │   └── settings/
│   │   │   ├── (client)/             # Portal cliente
│   │   │   │   └── [code]/           # Código de acceso
│   │   │   ├── api/                  # API routes
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui
│   │   │   ├── dashboard/            # Gráficas, stats
│   │   │   ├── documents/            # Dropzone, preview
│   │   │   ├── kanban/               # Board de proyectos
│   │   │   └── chat/                 # Widget de agente
│   │   ├── lib/
│   │   │   ├── supabase/             # Clientes
│   │   │   └── ai/                   # Wrappers LLM
│   │   ├── hooks/
│   │   └── styles/
│   │       └── globals.css
│   │
│   └── n8n-workflows/                # Exports JSON
│       ├── document-processor.json
│       ├── weekly-reports.json
│       └── whatsapp-notifications.json
│
├── packages/
│   ├── shared-types/                 # TypeScript común
│   ├── database/
│   │   ├── schema.sql                # Schema completo
│   │   └── migrations/
│   └── ai-prompts/                   # Prompts versionados
│       ├── invoice-extraction.txt
│       ├── email-classification.txt
│       └── response-generator.txt
│
├── infrastructure/
│   ├── docker-compose.yml            # Dev local
│   └── n8n-setup.md                  # Guía configuración
│
└── docs/
    ├── api-spec.md
    └── CHANGELOG.md
```

---

## 11. ROADMAP & COSTOS

### Fase 1: MVP (Mes 1-2) - €15/mes
- ✅ Auth por códigos de invitación
- ✅ Upload y procesamiento básico de PDF/imágenes
- ✅ Dashboard admin simple
- ✅ Portal cliente básico
- ✅ n8n self-hosted en VPS €5
- ✅ Supabase free tier

### Fase 2: Automatización (Mes 3) - €25/mes
- ⬜ Procesamiento Excel/CSV/HTML
- ⬜ Agente conversacional
- ⬜ Reportes automáticos semanales
- ⬜ WhatsApp notifications

### Fase 3: Escalado (Mes 4+) - €50-100/mes
- ⬜ Modelos locales (Ollama)
- ⬜ PWA móvil
- ⬜ White-label
- ⬜ Multi-moneda

---

## 12. CHECKLIST DE IMPLEMENTACIÓN

### Seguridad
- ⬜ Validar RLS en cada query (tenant_id check)
- ⬜ Manejar errores de IA con fallback OCR local
- ⬜ Rate limiting: Max 10 docs/min por tenant
- ⬜ Sanitización: Validar schema de extracted_data
- ⬜ Audit logs de todas las acciones
- ⬜ Backup diario de Supabase

### Performance
- ⬜ Índices en documents(tenant_id, created_at)
- ⬜ Índices en transactions(date, type)
- ⬜ Lazy loading de imágenes
- ⬜ Paginación en listados (+100 items)

### UX
- ⬜ Skeleton loaders en dashboards
- ⬜ Toast notifications para acciones
- ⬜ Drag & drop para documentos
- ⬜ Voice commands (opcional)
- ⬜ Offline mode básico

---

## 13. CONFIGURACIÓN RÁPIDA

### Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# AI APIs (OpenRouter - más barato)
OPENROUTER_API_KEY=xxx
OPENROUTER_MODEL=mistralai/mixtral-8x7b-instruct

# n8n Webhook
N8N_WEBHOOK_URL=https://n8n.xxx.com/webhook
N8N_SECRET=xxx

# Comunicaciones
RESEND_API_KEY=xxx
WHATSAPP_API_KEY=xxx
```

### Comandos de Inicio

```bash
# 1. Instalar dependencias
npm install

# 2. Setup Supabase
npx supabase link
npx supabase db push

# 3. Dev server
npm run dev

# 4. n8n local (Docker)
docker-compose up n8n
```

---

## ESTADO ACTUAL DEL PROYECTO

### ✅ Completado

| Módulo | Estado | Archivos |
|--------|--------|----------|
| Estructura del proyecto | ✅ | `/apps/web`, `/packages/`, `/infrastructure/` |
| Schema de Supabase | ✅ | `schema.sql` con todas las tablas, RLS, índices |
| Configuración Next.js | ✅ | `package.json`, `tsconfig.json`, `tailwind.config.ts` |
| Tema oscuro (Dark Mode) | ✅ | `globals.css` con variables CSS, glassmorphism |
| Página de inicio | ✅ | `page.tsx` con hero, stats, navegación |
| Sistema de códigos | ✅ | `/access/page.tsx`, API routes |
| Portal cliente | ✅ | `/(client)/[code]/page.tsx` |
| Dashboard admin | ✅ | `/(dashboard)/page.tsx` con stats |
| API Routes | ✅ | `auth/`, `client/`, `dashboard/` endpoints |
| Prompts de IA | ✅ | `invoice-extraction.txt`, `email-classification.txt` |
| Configuración n8n | ✅ | `n8n-setup.md` con workflows |

### 🏗️ Estructura del Proyecto

```
ledgerflow/
├── apps/
│   └── web/                    # Next.js 14 App Router
│       ├── app/
│       │   ├── (dashboard)/     # Rutas admin (layout + páginas)
│       │   ├── (client)/[code]/ # Portal cliente por código
│       │   ├── api/             # API routes
│       │   ├── page.tsx         # Landing page
│       │   ├── layout.tsx       # Root layout
│       │   └── globals.css      # Estilos dark mode
│       ├── components/          # Componentes React
│       ├── lib/                 # Utilidades, Supabase client
│       ├── hooks/               # Custom hooks
│       └── types/               # TypeScript types
├── packages/
│   ├── database/
│   │   └── schema.sql           # Schema completo Supabase
│   └── ai-prompts/              # Prompts versionados
│       ├── invoice-extraction.txt
│       ├── email-classification.txt
│       └── response-generator.txt
├── infrastructure/
│   └── n8n-setup.md             # Guía configuración n8n
└── AGENTS.md                    # Este documento
```

### 🚀 Próximos Pasos

1. **Autenticación completa**
   - JWT tokens
   - Middleware de protección de rutas
   - Refresh tokens

2. **Upload de documentos**
   - Integración Supabase Storage
   - Drag & drop component
   - Progreso de subida

3. **Procesamiento IA**
   - Webhook handler
   - Integración OpenAI Vision
   - Fallback OCR local

4. **Gráficas y visualizaciones**
   - Recharts integration
   - Cash flow chart
   - Project timeline

5. **Kanban board**
   - Drag & drop tareas
   - Columnas personalizables
   - Filtros y búsqueda

### 💰 Costos Mensuales Estimados (MVP)

| Servicio | Costo |
|----------|-------|
| Supabase Free Tier | $0 |
| Vercel Hobby | $0 |
| n8n Self-hosted (Railway) | $5 |
| OpenAI Vision (~500 docs) | $10-15 |
| **Total** | **$15-20/mes** |

---

**Contexto persistente:** Este proyecto es un SaaS B2B de gestión empresarial no-code, multi-tenant, diseño dark mode, acceso por códigos de invitación, procesamiento universal de documentos (PDF, imagen, Excel, HTML), automatización vía n8n + IA, comunicación proactiva por WhatsApp/email. Stack económico: Supabase + Next.js + n8n self-hosted + OpenRouter. Enfoque en visualización de datos y experiencia zero-config.
