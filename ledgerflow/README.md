# LedgerFlow - SaaS de Gestión Empresarial Inteligente

SaaS B2B multi-tenant para gestión contable, proyectos y comunicación con clientes. Procesamiento de documentos con IA, dashboards analíticos y acceso por códigos de invitación.

## 🚀 Stack Tecnológico

- **Frontend:** Next.js 14 + React 18 + TypeScript
- **Estilos:** Tailwind CSS + CSS Variables (Dark Mode)
- **Backend:** Next.js API Routes + Supabase
- **Base de Datos:** PostgreSQL (Supabase)
- **Storage:** Supabase Storage
- **Autenticación:** Supabase Auth
- **Estado:** Zustand
- **UI Components:** Radix UI + shadcn/ui
- **Gráficas:** Recharts
- **Drag & Drop:** @hello-pangea/dnd

## 📁 Estructura del Proyecto

```
ledgerflow/
├── apps/
│   └── web/                    # Next.js App Router
│       ├── app/
│       │   ├── (dashboard)/     # Rutas admin protegidas
│       │   │   ├── page.tsx     # Dashboard principal
│       │   │   ├── projects/    # Gestión de proyectos
│       │   │   ├── clients/     # Gestión de clientes
│       │   │   ├── documents/   # Gestión de documentos
│       │   │   ├── finances/    # Control financiero
│       │   │   └── settings/    # Configuración
│       │   ├── (client)/[code]/ # Portal cliente
│       │   ├── api/             # API routes
│       │   ├── access/          # Página de acceso con código
│       │   ├── page.tsx         # Landing page
│       │   ├── layout.tsx       # Root layout
│       │   └── globals.css      # Estilos globales
│       ├── components/
│       │   ├── ui/              # Componentes UI base
│       │   ├── dashboard/       # Componentes del dashboard
│       │   ├── documents/       # Componentes de documentos
│       │   └── kanban/          # Componentes del kanban
│       ├── lib/
│       │   ├── supabase/        # Clientes Supabase
│       │   ├── store/           # Zustand stores
│       │   └── utils.ts         # Utilidades
│       └── types/               # TypeScript types
├── packages/
│   ├── database/
│   │   └── schema.sql           # Schema completo Supabase
│   └── ai-prompts/              # Prompts versionados
├── infrastructure/
│   ├── docker-compose.yml       # Dev local
│   └── n8n-setup.md             # Guía configuración n8n
└── README.md
```

## ✨ Características Principales

### 🔐 Acceso por Códigos
- Sin contraseñas complejas
- Códigos tipo `ACME-2026-ABC`
- Portal de cliente dedicado

### 🤖 Procesamiento con IA
- OCR automático de facturas y recibos
- Extracción de datos estructurados
- Soporte para PDF, imágenes, Excel, CSV
- Webhook para n8n

### 📊 Dashboard Analítico
- Estadísticas en tiempo real
- Gráficas de flujo de caja
- Actividad reciente
- Métricas de negocio

### 📋 Gestión de Proyectos
- Kanban board con drag & drop
- Seguimiento de progreso
- Asignación de tareas
- Timeline de actividades

### 💰 Control Financiero
- Registro de ingresos y gastos
- Categorización automática
- Reportes visuales
- Exportación de datos

### 👥 Gestión de Clientes
- Perfiles de cliente
- Códigos de acceso únicos
- Historial de proyectos
- Comunicación integrada

## 🛠️ Instalación

### 1. Clonar y configurar

```bash
cd ledgerflow/apps/web
npm install
```

### 2. Variables de entorno

Crear `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# n8n Webhook (opcional)
N8N_WEBHOOK_URL=https://your-n8n.com/webhook
N8N_SECRET=your-webhook-secret
```

### 3. Base de datos

Ejecutar el schema SQL en Supabase:

```bash
# En Supabase SQL Editor
\i packages/database/schema.sql
```

### 4. Storage Bucket

Crear bucket `documents` en Supabase Storage con políticas de acceso.

### 5. Ejecutar

```bash
npm run dev
```

Visitar `http://localhost:3000`

## 🔑 Credenciales de Demo

- **Admin:** admin@demo.com / (cualquier contraseña en demo)
- **Código cliente:** DEMO-2026-ABC

## 📖 Guía de Uso

### Para Administradores

1. **Dashboard:** Vista general del negocio
2. **Proyectos:** Crear y gestionar proyectos
3. **Clientes:** Agregar clientes con códigos de acceso
4. **Documentos:** Subir y procesar documentos con IA
5. **Finanzas:** Control de ingresos y gastos
6. **Settings:** Configuración de cuenta

### Para Clientes

1. Acceder a `/access`
2. Ingresar código de invitación
3. Completar perfil (primera vez)
4. Ver proyectos y documentos asignados

## 🔗 Integración con n8n

El sistema está preparado para integrarse con n8n para:

- Procesamiento de documentos con IA
- Notificaciones automáticas
- Reportes programados
- Workflows personalizados

Ver `infrastructure/n8n-setup.md` para más detalles.

## 💰 Costos Estimados (MVP)

| Servicio | Costo |
|----------|-------|
| Supabase Free Tier | $0 |
| Vercel Hobby | $0 |
| n8n Self-hosted | ~$5/mes |
| OpenAI Vision | ~$10-20/mes |
| **Total** | **$15-25/mes** |

## 📝 Roadmap

- [x] Autenticación y autorización
- [x] Dashboard con métricas
- [x] Gestión de proyectos
- [x] Gestión de clientes
- [x] Upload de documentos
- [x] Kanban board
- [x] Control financiero básico
- [ ] Procesamiento IA completo
- [ ] Notificaciones WhatsApp
- [ ] Reportes automáticos
- [ ] PWA móvil

## 🤝 Contribuir

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/amazing`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Abrir Pull Request

## 📄 Licencia

MIT License - ver LICENSE para detalles.

---

**LedgerFlow** - Gestión empresarial simplificada con IA 🚀
