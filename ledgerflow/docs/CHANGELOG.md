# Changelog - LedgerFlow

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

### Added
- Sistema de autenticación (en desarrollo)
- Soporte para OCR avanzado
- Integración con Gmail API
- Módulo de proyectos (Kanban)
- Portal de clientes
- Exportación a Excel y PDF

---

## [0.3.0] - 2026-03-08

### Added
- Dashboard financiero completo con gráficos interactivos
- Sistema de ingesta de documentos automatizado
- Parsers para PDF, Excel, XML y TXT
- CRUD completo de transacciones
- Gestión de clientes multi-tenant
- Internacionalización (ES/EN/FR)
- UI moderna con glassmorphism
- Schema de base de datos con Prisma
- API REST completa
- Scripts de ingesta desde línea de comandos

### Features Detalladas

#### Dashboard Financiero
- ✅ Métricas en tiempo real (ingresos, gastos, balance)
- ✅ Gráfico de área para flujo de caja
- ✅ Gráfico de pastel para distribución por categoría
- ✅ Filtros avanzados por fecha, tipo y categoría
- ✅ Tabla de transacciones con ordenamiento
- ✅ Indicadores de tendencias (growth rate)

#### Sistema de Ingesta
- ✅ Procesamiento de PDFs con extracción de texto
- ✅ Parser de Excel (.xlsx, .xls, .csv)
- ✅ Parser de XML para facturas electrónicas (CFDI, UBL)
- ✅ Modo dry-run para preview sin guardar
- ✅ API endpoint para trigger de ingesta
- ✅ Script CLI para procesamiento batch

#### Gestión de Clientes
- ✅ Crear clientes con código único automático
- ✅ Listar y filtrar clientes
- ✅ Aislamiento de datos por clientId
- ✅ Contadores de transacciones, facturas y documentos

#### UI/UX
- ✅ Dark mode con glassmorphism
- ✅ Responsive design
- ✅ Sistema de traducciones completo
- ✅ Toast notifications con Sonner
- ✅ Modales interactivos
- ✅ Componentes shadcn/ui

### Technical
- Next.js 14 con App Router
- TypeScript 5
- Tailwind CSS 3.4
- PostgreSQL 16
- Prisma ORM 5
- Recharts para visualizaciones

---

## [0.2.0] - 2026-03-04

### Added
- Estructura base del proyecto con Next.js
- Configuración de Tailwind CSS
- Setup de shadcn/ui
- Sistema de traducciones básico
- Layout principal con sidebar
- Página de finanzas inicial
- Schema Prisma inicial

### Changed
- Migración de proyecto anterior (SGE)
- Reorganización de carpetas

---

## [0.1.0] - 2026-03-01

### Added
- Inicialización del proyecto
- Documentación base
- Configuración de repositorio

---

## Patrones de Commits

```
[ADD] - Nueva funcionalidad
[FIX] - Corrección de bug
[UPD] - Actualización/modificación
[REF] - Refactorización
[DOC] - Documentación
[TEST] - Tests
[DEP] - Dependencias
```

---

## Roadmap

### Q1 2026
- [x] Dashboard financiero
- [x] Ingesta de documentos
- [x] Multi-tenancy básico
- [ ] Autenticación (NextAuth.js)
- [ ] OCR avanzado con IA

### Q2 2026
- [ ] Módulo de proyectos (Kanban)
- [ ] Portal de clientes
- [ ] Reportes avanzados
- [ ] Procesamiento por email
- [ ] Tests unitarios y e2e

### Q3 2026
- [ ] App móvil (PWA)
- [ ] Integraciones bancarias
- [ ] API pública documentada
- [ ] Webhooks

### Q4 2026
- [ ] AI Chatbot asistente
- [ ] Predicciones financieras
- [ ] Multi-moneda avanzado
- [ ] White-label para partners

---

<div align="center">

**[← Volver al README](./LEDGERFLOW-README.md)**

</div>
