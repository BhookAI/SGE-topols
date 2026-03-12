# API Reference - LedgerFlow

Documentación completa de la API REST de LedgerFlow.

## Base URL

```
Desarrollo: http://localhost:3000/api
Producción: https://tu-dominio.com/api
```

## Autenticación

> ⚠️ **Nota**: La autenticación está en desarrollo. Actualmente las API son públicas en modo desarrollo.

## Content-Type

Todas las peticiones deben incluir:

```
Content-Type: application/json
```

---

## 📊 Transacciones

### Listar Transacciones

```http
GET /api/transactions?clientId={clientId}&limit={limit}&type={type}
```

**Parámetros de Query:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `clientId` | string | ✅ | ID del cliente |
| `limit` | number | ❌ | Límite de resultados (default: 100) |
| `type` | string | ❌ | Tipo: `income`, `expense`, `transfer` |
| `category` | string | ❌ | Filtrar por categoría |
| `status` | string | ❌ | Estado: `pending`, `approved`, `rejected` |

**Respuesta Exitosa (200):**

```json
{
  "transactions": [
    {
      "id": "clwxyz123...",
      "clientId": "clabc456...",
      "type": "income",
      "amount": 5000.00,
      "currency": "CRC",
      "description": "Venta de servicios de consultoría",
      "category": "Ingresos",
      "subcategory": "Servicios",
      "date": "2026-03-08T00:00:00.000Z",
      "vendorName": "Cliente ABC",
      "reference": "FAC-001",
      "isReconciled": true,
      "status": "approved",
      "source": "manual",
      "createdAt": "2026-03-08T10:00:00.000Z",
      "updatedAt": "2026-03-08T10:00:00.000Z"
    }
  ],
  "total": 1,
  "pagination": {
    "page": 1,
    "limit": 100,
    "totalPages": 1
  }
}
```

### Crear Transacción

```http
POST /api/transactions
```

**Body:**

```json
{
  "clientId": "clabc456...",
  "type": "expense",
  "amount": 1500.00,
  "currency": "CRC",
  "description": "Compra de insumos de oficina",
  "category": "Operaciones",
  "subcategory": "Oficina",
  "date": "2026-03-08",
  "vendorName": "Suministros XYZ",
  "reference": "REC-001",
  "status": "pending"
}
```

**Campos Requeridos:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `clientId` | string | ID del cliente |
| `type` | enum | `income`, `expense`, `transfer`, `adjustment` |
| `amount` | number | Monto (positivo) |
| `description` | string | Descripción de la transacción |
| `date` | string | Fecha en formato ISO (YYYY-MM-DD) |

**Campos Opcionales:**

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `currency` | string | "CRC" | Moneda (CRC, USD, MXN, EUR) |
| `category` | string | null | Categoría de clasificación |
| `subcategory` | string | null | Subcategoría |
| `vendorName` | string | null | Nombre del proveedor/cliente |
| `reference` | string | null | Número de referencia/factura |
| `status` | enum | "pending" | `pending`, `approved`, `rejected` |

**Respuesta Exitosa (201):**

```json
{
  "id": "clwxyz123...",
  "clientId": "clabc456...",
  "type": "expense",
  "amount": 1500.00,
  "currency": "CRC",
  "description": "Compra de insumos de oficina",
  "category": "Operaciones",
  "date": "2026-03-08T00:00:00.000Z",
  "status": "pending",
  "createdAt": "2026-03-08T10:30:00.000Z"
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 400 | Datos inválidos o faltantes |
| 404 | Cliente no encontrado |
| 500 | Error interno del servidor |

### Actualizar Transacción

```http
PUT /api/transactions?id={transactionId}
```

**Body:** (campos a actualizar)

```json
{
  "description": "Nueva descripción",
  "status": "approved",
  "isReconciled": true
}
```

### Eliminar Transacción

```http
DELETE /api/transactions?id={transactionId}
```

---

## 👥 Clientes

### Listar Clientes

```http
GET /api/clients
```

**Respuesta Exitosa (200):**

```json
{
  "clients": [
    {
      "id": "clabc456...",
      "code": "ACME-2026-001",
      "name": "ACME Corporation",
      "email": "contacto@acme.com",
      "phone": "+506 8888-8888",
      "company": "ACME Corp",
      "taxId": "3-101-123456",
      "address": "San José, Costa Rica",
      "isActive": true,
      "createdAt": "2026-01-15T08:00:00.000Z",
      "updatedAt": "2026-03-08T10:00:00.000Z",
      "_count": {
        "transactions": 45,
        "invoices": 12,
        "documents": 8
      }
    }
  ],
  "total": 1
}
```

### Obtener Cliente Específico

```http
GET /api/clients?id={clientId}
```

### Crear Cliente

```http
POST /api/clients
```

**Body:**

```json
{
  "name": "Nueva Empresa S.A.",
  "email": "info@nuevaempresa.com",
  "phone": "+506 7777-7777",
  "company": "Nueva Empresa",
  "taxId": "3-102-654321",
  "address": "Heredia, Costa Rica"
}
```

**Respuesta Exitosa (201):**

```json
{
  "id": "cldef789...",
  "code": "NE-2026-003",
  "name": "Nueva Empresa S.A.",
  "email": "info@nuevaempresa.com",
  "phone": "+506 7777-7777",
  "company": "Nueva Empresa",
  "taxId": "3-102-654321",
  "address": "Heredia, Costa Rica",
  "isActive": true,
  "createdAt": "2026-03-08T11:00:00.000Z",
  "updatedAt": "2026-03-08T11:00:00.000Z"
}
```

> 💡 **Nota**: El código se genera automáticamente con formato `{PREFIX}-{AÑO}-{SECUENCIA}`

### Actualizar Cliente

```http
PUT /api/clients?id={clientId}
```

### Eliminar Cliente

```http
DELETE /api/clients?id={clientId}
```

> ⚠️ **Advertencia**: Eliminar un cliente elimina en cascada todas sus transacciones, facturas y documentos.

---

## 📄 Ingesta de Documentos

### Trigger Ingesta

```http
POST /api/ingest
```

**Body:**

```json
{
  "clientId": "clabc456...",
  "folderPath": "./client-data/acme-corp",
  "dryRun": false
}
```

**Parámetros:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `clientId` | string | ✅ | ID del cliente |
| `folderPath` | string | ✅ | Ruta a la carpeta con documentos |
| `dryRun` | boolean | ❌ | Si es true, solo preview sin guardar |

**Respuesta Exitosa (200):**

```json
{
  "success": true,
  "clientId": "clabc456...",
  "folderPath": "./client-data/acme-corp",
  "processedFiles": 15,
  "results": {
    "pdfs": {
      "processed": 5,
      "transactions": 12
    },
    "excels": {
      "processed": 3,
      "transactions": 45
    },
    "xmls": {
      "processed": 7,
      "invoices": 7
    }
  },
  "errors": [],
  "dryRun": false,
  "timestamp": "2026-03-08T12:00:00.000Z"
}
```

**Respuesta con Errores (207 - Multi-Status):**

```json
{
  "success": true,
  "processedFiles": 14,
  "results": { ... },
  "errors": [
    {
      "file": "factura_danada.pdf",
      "error": "No se pudo extraer texto del PDF",
      "type": "PDF"
    }
  ]
}
```

---

## 🧾 Facturas Electrónicas

### Listar Facturas

```http
GET /api/invoices?clientId={clientId}
```

### Crear Factura (desde XML)

```http
POST /api/invoices
```

**Body:**

```json
{
  "clientId": "clabc456...",
  "xmlContent": "<?xml version=\"1.0\"...",
  "pdfPath": "/path/to/optional.pdf"
}
```

---

## 📁 Documentos

### Listar Documentos de Cliente

```http
GET /api/documents?clientId={clientId}
```

### Subir Documento

```http
POST /api/documents
```

**Content-Type:** `multipart/form-data`

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `clientId` | string | ID del cliente |
| `file` | File | Archivo a subir |
| `processImmediately` | boolean | Procesar con IA inmediatamente |

---

## 📊 Estadísticas

### Obtener Dashboard Stats

```http
GET /api/stats/dashboard?clientId={clientId}&period={period}
```

**Parámetros:**

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `clientId` | string | - | ID del cliente |
| `period` | string | "month" | `week`, `month`, `quarter`, `year` |

**Respuesta:**

```json
{
  "income": 50000.00,
  "expenses": 32500.00,
  "balance": 17500.00,
  "incomeGrowth": 15.5,
  "expenseGrowth": -5.2,
  "topCategories": [
    { "name": "Servicios", "amount": 30000.00 },
    { "name": "Productos", "amount": 20000.00 }
  ],
  "pendingTransactions": 5,
  "monthlyTrend": [
    { "month": "Ene", "income": 45000, "expenses": 30000 },
    { "month": "Feb", "income": 48000, "expenses": 31000 },
    { "month": "Mar", "income": 50000, "expenses": 32500 }
  ]
}
```

---

## 🔧 Códigos de Error

| Código | Nombre | Descripción |
|--------|--------|-------------|
| 200 | OK | Petición exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no encontrado |
| 422 | Unprocessable Entity | Validación fallida |
| 500 | Internal Server Error | Error del servidor |

---

## 📝 Ejemplos con cURL

### Flujo Completo

```bash
# 1. Crear cliente
CLIENT=$(curl -s -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Mi Empresa","email":"test@test.com"}' | jq -r '.id')

# 2. Crear transacción de ingreso
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$CLIENT\",
    \"type\": \"income\",
    \"amount\": 10000,
    \"description\": \"Venta de servicios\",
    \"date\": \"$(date +%Y-%m-%d)\"
  }"

# 3. Crear transacción de gasto
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$CLIENT\",
    \"type\": \"expense\",
    \"amount\": 2500,
    \"description\": \"Alquiler oficina\",
    \"category\": \"Operaciones\",
    \"date\": \"$(date +%Y-%m-%d)\"
  }"

# 4. Ver estadísticas
curl "http://localhost:3000/api/stats/dashboard?clientId=$CLIENT&period=month"
```

---

<div align="center">

**[← Volver al README](./LEDGERFLOW-README.md)**

</div>
