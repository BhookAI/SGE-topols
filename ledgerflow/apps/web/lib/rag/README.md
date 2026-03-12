# LedgerFlow RAG Module

Sistema de Retrieval-Augmented Generation (RAG) para LedgerFlow.

Permite procesar documentos (PDF, Excel, TXT, XML) y consultarlos mediante inteligencia artificial.

---

## 🚀 Instalación Rápida

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
# Copiar .env.local y agregar:
# OPENAI_API_KEY=sk-...
# CHROMA_URL=http://localhost:8000 (opcional, default)

# 3. Iniciar ChromaDB (con Docker)
docker run -d -p 8000:8000 chromadb/chroma:latest

# 4. Listo!
```

---

## 📁 Estructura

```
lib/rag/
├── config.ts       # Configuración
├── chroma.ts       # Cliente ChromaDB
├── openai.ts       # Servicio OpenAI
├── processors.ts   # Procesadores de archivos
├── ingest.ts       # Servicio de ingestión
├── query.ts        # Servicio de consultas
└── index.ts        # Exports

app/api/rag/
├── ingest/route.ts # POST/GET/DELETE /api/rag/ingest
└── query/route.ts  # POST/GET /api/rag/query

scripts/rag/
├── ingest.ts       # CLI para ingestión
└── query.ts        # CLI para consultas
```

---

## 💻 Uso CLI

### Ingesta de Documentos

```bash
# Procesar directorio completo
npm run ingest -- --client=acme-001 --path=./client-data/acme

# Procesar un archivo
npm run ingest -- --client=acme-001 --file=./factura.pdf

# Limpiar y reingestar
npm run ingest -- --client=acme-001 --clear --path=./nuevos-docs

# Ver estadísticas
npm run ingest -- --client=acme-001 --stats

# Dry-run (simular sin guardar)
npm run ingest -- --client=acme-001 --path=./docs --dry-run
```

### Consultas RAG

```bash
# Consulta general
npx tsx scripts/rag/query.ts --client=acme-001 --query="¿Cuánto gastamos en marzo?"

# Consulta de transacciones
npx tsx scripts/rag/query.ts --client=acme-001 --type=transactions --query="facturas pendientes"

# Generar resumen
npx tsx scripts/rag/query.ts --client=acme-001 --summary

# Extraer transacciones
npx tsx scripts/rag/query.ts --client=acme-001 --extract
```

---

## 🔌 API Endpoints

### Ingesta

```bash
# POST - Ingestar documentos
curl -X POST http://localhost:3000/api/rag/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "acme-001",
    "folderPath": "./client-data/acme",
    "clearExisting": false
  }'

# GET - Estadísticas
curl "http://localhost:3000/api/rag/ingest?clientId=acme-001"

# DELETE - Limpiar datos
curl -X DELETE http://localhost:3000/api/rag/ingest \
  -H "Content-Type: application/json" \
  -d '{"clientId": "acme-001"}'
```

### Consultas

```bash
# POST - Consulta RAG
curl -X POST http://localhost:3000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "acme-001",
    "query": "¿Cuáles son los gastos más grandes?",
    "type": "general",
    "topK": 5
  }'

# GET - Extraer transacciones
curl "http://localhost:3000/api/rag/query/transactions?clientId=acme-001"

# GET - Resumen ejecutivo
curl "http://localhost:3000/api/rag/query?clientId=acme-001&action=summary"
```

---

## 📄 Formatos Soportados

| Formato | Extensión | Descripción |
|---------|-----------|-------------|
| PDF | .pdf | Facturas, recibos, estados de cuenta |
| Excel | .xlsx, .xls | Hojas de cálculo, reportes |
| CSV | .csv | Datos tabulares |
| Word | .docx | Documentos de texto |
| Texto | .txt | Archivos planos |
| XML | .xml | Facturas electrónicas (CFDI, UBL) |
| JSON | .json | Datos estructurados |

---

## 🏗️ Arquitectura

```
Usuario → API/CLI → Procesadores → Embeddings → ChromaDB
                       ↓              ↑
                    OpenAI ←─────── Consulta
```

1. **Procesamiento**: Archivos → Texto plano → Chunks
2. **Embeddings**: Chunks → Vectores (OpenAI text-embedding-3-small)
3. **Almacenamiento**: Vectores + Metadata → ChromaDB
4. **Consulta**: Query → Embedding → Búsqueda similitud → GPT-4 → Respuesta

---

## ⚙️ Configuración

Variables de entorno:

```env
# OpenAI (Requerido)
OPENAI_API_KEY=sk-...

# ChromaDB (Opcional)
CHROMA_URL=http://localhost:8000

# Modelos (Opcional)
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4-turbo-preview
```

---

## 🔒 Multi-tenancy

Cada cliente tiene su propio namespace aislado:

```
Collection: ledgerflow_documents_client_{clientId}
```

Los datos de un cliente nunca se mezclan con otros.

---

## 📊 Flujo de Trabajo Recomendado

### Para nuevos clientes:

```bash
# 1. Crear carpeta del cliente
mkdir -p client-data/nuevo-cliente

# 2. Copiar documentos
cp /ruta/documentos/* client-data/nuevo-cliente/

# 3. Procesar
npm run ingest -- --client=nuevo-cliente --path=./client-data/nuevo-cliente

# 4. Verificar
npm run ingest -- --client=nuevo-cliente --stats

# 5. Consultar!
npx tsx scripts/rag/query.ts --client=nuevo-cliente --summary
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to ChromaDB"
```bash
# Verificar que ChromaDB está corriendo
docker ps | grep chroma

# Si no, iniciarlo:
docker run -d -p 8000:8000 chromadb/chroma:latest
```

### Error: "OpenAI API key not found"
```bash
# Verificar variable de entorno
echo $OPENAI_API_KEY

# O agregar a .env.local
```

### Error: "File format not supported"
Verificar que el archivo tiene extensión correcta y está en la lista de formatos soportados.

---

## 📈 Rendimiento

- **PDFs**: ~1-2s por página
- **Excel**: ~0.5s por hoja
- **Consultas**: ~2-5s (incluye embedding + búsqueda + GPT)

---

<div align="center">

**[← Volver a la documentación principal](../../docs/README.md)**

</div>
