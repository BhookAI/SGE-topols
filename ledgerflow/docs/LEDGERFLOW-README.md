# LedgerFlow

<div align="center">

![LedgerFlow Logo](./images/logo.png)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

**Sistema de Gestión Empresarial con Inteligencia Artificial**

[Demo](https://ledgerflow-demo.vercel.app) • [Documentación](./docs) • [API Reference](./docs/API.md)

</div>

---

## 📋 Índice

- [Visión General](#visión-general)
- [Características](#características)
- [Arquitectura](#arquitectura)
- [Stack Tecnológico](#stack-tecnológico)
- [Instalación](#instalación)
- [Uso](#uso)
- [API](#api)
- [Roadmap](#roadmap)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## 🎯 Visión General

LedgerFlow es una plataforma empresarial integral diseñada para automatizar la gestión contable, administrativa y de atención al cliente mediante el poder de la inteligencia artificial.

### ¿Por qué LedgerFlow?

- 🤖 **Procesamiento Automatizado**: Extrae datos automáticamente de PDFs, Excels, XMLs y más
- 🏢 **Multi-tenant**: Gestión separada y segura para cada cliente
- 🌍 **Multi-idioma**: Soporte completo en Español, Inglés y Francés
- 📊 **Dashboards Inteligentes**: Visualizaciones en tiempo con métricas clave
- 🔒 **Seguridad Empresarial**: Arquitectura segura con aislamiento de datos

---

## ✨ Características

### 💰 Dashboard Financiero

| Métrica | Descripción |
|---------|-------------|
| Ingresos/Gastos | Seguimiento en tiempo real con comparativas |
| Balance Neto | Cálculo automático con márgenes |
| Tendencias | Gráficos de área con proyecciones |
| Categorización | Clasificación inteligente de transacciones |

### 📄 Ingesta de Documentos (IA)

```
┌─────────────────────────────────────────────────────────┐
│  Sistema de Ingesta Automatizada                        │
├─────────────────────────────────────────────────────────┤
│  📄 PDF → OCR + NLP → Datos Estructurados              │
│  📊 Excel → Parser → Transacciones                     │
│  🧾 XML → CFDI/UBL → Facturas Electrónicas             │
│  📧 Email → Gmail API → Extracción Automática          │
└─────────────────────────────────────────────────────────┘
```

**Formatos Soportados:**
- ✅ PDF (Facturas, Recibos, Estados de cuenta)
- ✅ Excel (.xlsx, .xls, .csv)
- ✅ XML (CFDI México, UBL, Factura-e)
- ✅ TXT/CSV (Extractos bancarios)

### 🎨 UI Moderna

- **Dark Mode**: Diseño glassmorphism profesional
- **Responsive**: Adaptable a cualquier dispositivo
- **Interactiva**: Notificaciones toast, modales, tooltips
- **Accesible**: Cumple con estándares WCAG 2.1

---

## 🏗️ Arquitectura

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │   Next.js    │ │  Dashboard   │ │    Document Upload       │ │
│  │   (App)      │ │   Financiero │ │    (Drag & Drop)         │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│                         │                                        │
│  ┌────────────────────────────────────────────────────────────┐│
│  │                 COMPONENTES UI (shadcn/ui)                  ││
│  │  Cards • Tables • Dialogs • Charts • Forms • Badges         ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │/api/transact │ │ /api/clients │ │    /api/ingest           │ │
│  │   ions       │ │              │ │                          │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │   Parsers    │ │  Validators  │ │    AI Processing         │ │
│  │  (PDF/Excel) │ │              │ │    (Extracción IA)       │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    PostgreSQL + Prisma ORM                  │ │
│  │  Clients • Transactions • Invoices • Documents • Projects   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Modelo de Datos Multi-tenant

```
┌─────────────┐       ┌─────────────────┐       ┌───────────────┐
│   Client    │───────│  Transaction    │       │   Invoice     │
├─────────────┤       ├─────────────────┤       ├───────────────┤
│ id (PK)     │       │ id (PK)         │       │ id (PK)       │
│ code (UQ)   │◄──────│ clientId (FK)   │       │ clientId (FK) │
│ name        │       │ type            │       │ uuid (UQ)     │
│ email       │       │ amount          │       │ issuerName    │
│ taxId       │       │ category        │       │ total         │
└─────────────┘       │ date            │       │ xmlContent    │
       │              └─────────────────┘       └───────────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌───────────────┐ ┌───────────────┐
│ClientDocument │ │   Project     │
├───────────────┤ ├───────────────┤
│ id (PK)       │ │ id (PK)       │
│ clientId (FK) │ │ clientId (FK) │
│ filename      │ │ name          │
│ fileType      │ │ budget        │
│ extractedData │ │ status        │
└───────────────┘ └───────────────┘
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| **Framework** | Next.js | 14+ | App Router, SSR, API Routes |
| **Lenguaje** | TypeScript | 5.0+ | Tipado estático |
| **Estilos** | Tailwind CSS | 3.4+ | Utility-first CSS |
| **UI** | shadcn/ui | Latest | Componentes accesibles |
| **Charts** | Recharts | 2.0+ | Visualizaciones de datos |
| **Base de Datos** | PostgreSQL | 16+ | Base de datos relacional |
| **ORM** | Prisma | 5.0+ | Mapeo objeto-relacional |
| **Validación** | Zod | 3.0+ | Schema validation |
| **Notificaciones** | Sonner | Latest | Toast notifications |
| **Icons** | Lucide React | Latest | Iconos vectoriales |

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Paso a Paso

```bash
# 1. Clonar repositorio
git clone git@github.com:BhookAI/ledgerflow.git
cd ledgerflow/apps/web

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tu DATABASE_URL

# 4. Generar cliente Prisma
npm run db:generate

# 5. Ejecutar migraciones
npm run db:migrate
# O usar: npx prisma db push

# 6. Cargar datos de prueba
npm run db:seed

# 7. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 📖 Uso

### Dashboard Financiero

1. Accede a `/dashboard/finances`
2. Visualiza métricas en tiempo real
3. Usa filtros para segmentar datos
4. Exporta reportes en diferentes formatos

### Gestión de Transacciones

```bash
# Crear transacción manual
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "CLIENT_ID",
    "type": "expense",
    "amount": 1500.00,
    "currency": "CRC",
    "description": "Compra de insumos",
    "category": "Operaciones",
    "date": "2026-03-08"
  }'
```

### Ingesta de Documentos

#### Vía Script

```bash
# Modo normal (guarda en DB)
npm run ingest -- --client=CLIENT_ID --path=./client-data/empresa

# Modo dry-run (solo preview)
npm run ingest -- --client=CLIENT_ID --path=./client-data/empresa --dry-run
```

#### Vía API

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "CLIENT_ID",
    "folderPath": "./client-data/empresa",
    "dryRun": false
  }'
```

---

## 🔌 API

### Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/transactions` | Listar transacciones |
| `POST` | `/api/transactions` | Crear transacción |
| `GET` | `/api/clients` | Listar clientes |
| `POST` | `/api/clients` | Crear cliente |
| `POST` | `/api/ingest` | Trigger ingesta |

### Ejemplos de Respuesta

```json
// GET /api/transactions
{
  "transactions": [
    {
      "id": "clxxx...",
      "type": "income",
      "amount": 5000.00,
      "currency": "CRC",
      "description": "Venta de servicios",
      "category": "Ingresos",
      "date": "2026-03-08T00:00:00.000Z",
      "status": "approved"
    }
  ],
  "total": 1
}
```

Documentación completa: [API Reference](./docs/API.md)

---

## 🗺️ Roadmap

### Completado ✅

- [x] Sistema de ingesta de documentos
- [x] Parsers PDF, Excel, XML
- [x] Dashboard financiero con gráficos
- [x] CRUD de transacciones
- [x] API routes multi-tenant
- [x] Sistema de traducciones (i18n)

### En Progreso 🚧

- [ ] Autenticación (NextAuth.js)
- [ ] OCR avanzado con IA
- [ ] Procesamiento por email (Gmail API)

### Pendiente 📋

- [ ] Módulo de proyectos (Kanban)
- [ ] Portal de clientes
- [ ] Reportes avanzados
- [ ] Tests unitarios y e2e
- [ ] Documentación interactiva

---

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](./LICENSE) para más detalles.

---

<div align="center">

**Desarrollado con ❤️ por el equipo LedgerFlow**

[Documentación](./docs) • [Reportar Issue](https://github.com/BhookAI/ledgerflow/issues) • [Discusiones](https://github.com/BhookAI/ledgerflow/discussions)

</div>
