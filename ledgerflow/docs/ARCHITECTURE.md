# Arquitectura de LedgerFlow

Documentación técnica detallada de la arquitectura del sistema.

## Tabla de Contenidos

- [Visión General](#visión-general)
- [Principios de Diseño](#principios-de-diseño)
- [Arquitectura en Capas](#arquitectura-en-capas)
- [Modelo de Datos](#modelo-de-datos)
- [Flujo de Ingesta](#flujo-de-ingesta)
- [Seguridad](#seguridad)
- [Escalabilidad](#escalabilidad)

---

## Visión General

LedgerFlow sigue una arquitectura **monolítica modular** con separación clara de responsabilidades. Diseñada para ser:

- **Mantenible**: Código organizado por dominios
- **Escalable**: Preparada para crecimiento horizontal
- **Segura**: Multi-tenancy con aislamiento de datos
- **Extensible**: Fácil de extender con nuevos parsers y módulos

---

## Principios de Diseño

### 1. Multi-tenancy por Aislamiento de Datos

Cada cliente opera en su propio "compartimento" lógico:

```typescript
// Todas las queries incluyen clientId
prisma.transaction.findMany({
  where: { clientId: 'cl_xxx' }
})
```

### 2. Procesamiento Asíncrono

La ingesta de documentos opera en background:

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Upload  │────▶│  Queue   │────▶│ Process  │
│  File    │     │          │     │  File    │
└──────────┘     └──────────┘     └──────────┘
```

### 3. Parser Pattern

Cada tipo de documento tiene su propio parser:

```typescript
interface DocumentParser {
  canParse(fileType: string): boolean;
  parse(filePath: string): Promise<ParsedData>;
}

class PDFParser implements DocumentParser { ... }
class ExcelParser implements DocumentParser { ... }
class XMLInvoiceParser implements DocumentParser { ... }
```

---

## Arquitectura en Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │   Pages    │  │ Components │  │       Hooks            │ │
│  │  (Next.js) │  │(shadcn/ui) │  │  (useTranslation)      │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      API LAYER                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │   Routes   │  │  Handlers  │  │     Validation         │ │
│  │  (/api/*)  │  │            │  │       (Zod)            │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                 BUSINESS LOGIC LAYER                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │   Parsers  │  │  Services  │  │     Ingest Engine      │ │
│  │            │  │            │  │                        │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      DATA LAYER                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Prisma ORM + PostgreSQL                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Capa de Presentación

**Responsabilidad**: Interfaz de usuario y experiencia

```
app/
├── layout.tsx           # Root layout con providers
├── globals.css          # Estilos globales + Tailwind
├── dashboard/
│   └── finances/
│       └── page.tsx     # Dashboard financiero
components/
├── ui/                  # Componentes shadcn/ui
├── layout/              # Layout components
└── charts/              # Gráficos personalizados
lib/
└── i18n/                # Sistema de traducciones
```

**Tecnologías**:
- Next.js 14 App Router
- Tailwind CSS
- shadcn/ui
- Recharts
- Lucide React

### Capa de API

**Responsabilidad**: Endpoints HTTP y validación

```
app/api/
├── transactions/
│   └── route.ts         # CRUD transacciones
├── clients/
│   └── route.ts         # CRUD clientes
├── ingest/
│   └── route.ts         # Trigger ingesta
└── documents/
    └── route.ts         # Gestión documentos
```

**Patrón**: Route Handlers de Next.js App Router

```typescript
// app/api/transactions/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')
  
  // Validación
  if (!clientId) {
    return Response.json({ error: 'clientId required' }, { status: 400 })
  }
  
  // Query
  const transactions = await prisma.transaction.findMany({
    where: { clientId },
    orderBy: { date: 'desc' }
  })
  
  return Response.json({ transactions })
}
```

### Capa de Lógica de Negocio

**Responsabilidad**: Procesamiento de documentos y reglas de negocio

```
scripts/
├── ingest.ts            # Script principal de ingesta
└── parsers/
    ├── pdf-parser.ts    # Parser PDF con OCR
    ├── excel-parser.ts  # Parser Excel/CSV
    ├── xml-invoice-parser.ts  # Parser XML CFDI/UBL
    └── txt-parser.ts    # Parser TXT
```

### Capa de Datos

**Responsabilidad**: Persistencia y modelado de datos

```
prisma/
├── schema.prisma        # Definición de modelos
└── seed.ts              # Datos de prueba
```

---

## Modelo de Datos

### Diagrama ER

```
┌─────────────────┐         ┌─────────────────┐
│     Client      │         │  AuditLog       │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ code (UQ)       │         │ clientId (FK)   │
│ name            │         │ action          │
│ email           │         │ entity          │
│ phone           │         │ entityId        │
│ company         │         │ oldData (JSON)  │
│ taxId           │         │ newData (JSON)  │
│ address         │         │ performedBy     │
│ isActive        │         │ createdAt       │
│ createdAt       │         └─────────────────┘
│ updatedAt       │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴─────────────────────────────────────────────┐
    │                                                  │
    ▼                                                  ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ClientDocument   │    │  Transaction    │    │    Invoice      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ clientId (FK)   │    │ clientId (FK)   │    │ clientId (FK)   │
│ filename        │    │ type            │    │ uuid (UQ)       │
│ fileType        │    │ amount          │    │ folio           │
│ filePath        │    │ currency        │    │ issuerName      │
│ fileSize        │    │ description     │    │ issuerTaxId     │
│ extractedText   │    │ category        │    │ subtotal        │
│ extractedData   │    │ subcategory     │    │ taxAmount       │
│ extractionStatus│    │ date            │    │ total           │
│ uploadedAt      │    │ vendorName      │    │ currency        │
│ processedAt     │    │ reference       │    │ issueDate       │
│ errors          │    │ isReconciled    │    │ xmlContent      │
└─────────────────┘    │ status          │    │ pdfPath         │
                       │ source          │    └─────────────────┘
                       │ metadata        │
                       └─────────────────┘
```

### Enums

```prisma
enum TransactionType {
  income      // Ingreso
  expense     // Gasto
  transfer    // Transferencia entre cuentas
  adjustment  // Ajuste contable
}

enum TransactionStatus {
  pending   // Pendiente de revisión
  approved  // Aprobado
  rejected  // Rechazado
}

enum DocumentType {
  PDF
  EXCEL
  XML_FACTURA
  CSV
  TXT
  WORD
  IMAGE
  OTHER
}

enum ExtractionStatus {
  pending     // Esperando procesamiento
  processing  // En proceso
  completed   // Completado
  error       // Error en procesamiento
}

enum InvoiceStatus {
  active     // Factura vigente
  cancelled  // Factura cancelada
}

enum ProjectStatus {
  planning
  in_progress
  review
  completed
  cancelled
}
```

---

## Flujo de Ingesta

### Diagrama de Secuencia

```
Usuario          API              Ingest         Parser         DB
  │               │                │              │              │
  │─POST /ingest─▶│                │              │              │
  │               │───trigger()───▶│              │              │
  │               │                │              │              │
  │               │                │──scan dir───┐│              │
  │               │                │◄──files────┘│              │
  │               │                │              │              │
  │               │                ├─for each file              │
  │               │                │              │              │
  │               │                │─detect type▶│              │
  │               │                │◄──parser───┘│              │
  │               │                │              │              │
  │               │                │──parse()───▶│              │
  │               │                │◄─extracted─┘│              │
  │               │                │              │              │
  │               │                │──validate───┐│              │
  │               │                │◄──result───┘│              │
  │               │                │              │              │
  │               │                │────save()──────────────────▶│
  │               │                │              │              │
  │               │◄──response────│              │              │
  │◄─results──────│                │              │              │
```

### Proceso Detallado

1. **Trigger**: API recibe solicitud de ingesta
2. **Scan**: Escanea directorio del cliente
3. **Clasificación**: Detecta tipo de archivo
4. **Parsing**: Extrae datos según tipo
5. **Validación**: Valida datos extraídos
6. **Persistencia**: Guarda en base de datos
7. **Reporte**: Retorna resumen de procesamiento

---

## Seguridad

### Estrategia Multi-tenant

```typescript
// Middleware de aislamiento
async function withClientIsolation(
  handler: Handler,
  clientId: string
): Promise<Response> {
  // Verificar que client existe
  const client = await prisma.client.findUnique({
    where: { id: clientId }
  })
  
  if (!client) {
    return Response.json({ error: 'Client not found' }, { status: 404 })
  }
  
  // Ejecutar handler con clientId validado
  return handler(clientId)
}
```

### Medidas Implementadas

| Capa | Medida | Descripción |
|------|--------|-------------|
| API | Validación Zod | Schema validation en todas las entradas |
| DB | Foreign Keys | Integridad referencial en todas las relaciones |
| DB | Índices | Índices en clientId para queries rápidas |
| App | Sanitización | Escape de datos antes de renderizar |
| Env | Variables | Secrets en .env.local (no commiteados) |

### Próximas Mejoras

- [ ] Row Level Security (RLS) en PostgreSQL
- [ ] Autenticación JWT con NextAuth.js
- [ ] Rate limiting por cliente
- [ ] Audit logging completo
- [ ] Encriptación de datos sensibles

---

## Escalabilidad

### Estrategia Actual

```
┌──────────────────────────────────────────────┐
│              Next.js App                      │
│  (Serverless Functions en Vercel/AWS)        │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│         PostgreSQL (Managed)                 │
│  (AWS RDS / Supabase / Railway)              │
└──────────────────────────────────────────────┘
```

### Estrategia de Crecimiento

#### Fase 1: Optimización (Actual)

- ✅ Índices optimizados
- ✅ Queries paginadas
- ✅ Caching en componentes

#### Fase 2: Caching Distribuido

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Next.js │────▶│  Redis   │────▶│    DB    │
│          │◄────│  Cache   │◄────│          │
└──────────┘     └──────────┘     └──────────┘
```

#### Fase 3: Cola de Procesamiento

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Upload  │────▶│  Queue   │────▶│ Workers  │
│          │     │ (BullMQ) │     │          │
└──────────┘     └──────────┘     └──────────┘
```

#### Fase 4: Microservicios

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   API       │   │  Ingest     │   │   Auth      │
│  Gateway    │──▶│  Service    │   │  Service    │
└─────────────┘   └─────────────┘   └─────────────┘
```

---

<div align="center">

**[← Volver al README](./LEDGERFLOW-README.md)**

</div>
