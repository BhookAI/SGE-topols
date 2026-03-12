# Guía de Instalación - LedgerFlow

Guía completa paso a paso para instalar y configurar LedgerFlow.

---

## 📋 Requisitos del Sistema

### Hardware Mínimo

| Recurso | Requisito |
|---------|-----------|
| RAM | 4 GB |
| Disco | 10 GB libres |
| CPU | 2 cores |
| Red | Conexión a internet |

### Software Requerido

| Software | Versión | Propósito |
|----------|---------|-----------|
| Node.js | 18.x o superior | Runtime de JavaScript |
| npm | 9.x o superior | Gestor de paquetes |
| PostgreSQL | 14.x o superior | Base de datos |
| Git | 2.x o superior | Control de versiones |

---

## 🚀 Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone git@github.com:BhookAI/ledgerflow.git
cd ledgerflow/apps/web

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Configurar base de datos
npm run db:generate
npm run db:migrate

# 5. Cargar datos de prueba
npm run db:seed

# 6. Iniciar servidor
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

---

## 🔧 Instalación Detallada

### Paso 1: Preparar el Entorno

#### Instalar Node.js

**En macOS (con Homebrew):**
```bash
brew install node
```

**En Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**En Fedora:**
```bash
sudo dnf install nodejs npm
```

**Verificar instalación:**
```bash
node --version  # v20.x.x
npm --version   # 10.x.x
```

#### Instalar PostgreSQL

**En macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**En Ubuntu:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**En Fedora:**
```bash
sudo dnf install postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl start postgresql
```

**Crear base de datos:**
```bash
# Acceder a PostgreSQL
sudo -u postgres psql

# Crear usuario
CREATE USER ledgerflow WITH PASSWORD 'tu_password_seguro';

# Crear base de datos
CREATE DATABASE ledgerflow OWNER ledgerflow;

# Dar permisos
GRANT ALL PRIVILEGES ON DATABASE ledgerflow TO ledgerflow;

# Salir
\q
```

---

### Paso 2: Clonar y Configurar

```bash
# Clonar repositorio
git clone git@github.com:BhookAI/ledgerflow.git
cd ledgerflow/apps/web

# Instalar dependencias
npm install
```

**Durante la instalación se instalarán:**
- Next.js 14
- React 18
- TypeScript 5
- Tailwind CSS 3
- Prisma ORM
- shadcn/ui components
- Recharts
- Y muchas más...

---

### Paso 3: Variables de Entorno

Crear archivo `.env.local`:

```bash
cp .env.example .env.local
```

Editar `.env.local`:

```env
# ==========================================
# BASE DE DATOS (REQUERIDO)
# ==========================================
DATABASE_URL="postgresql://ledgerflow:tu_password_seguro@localhost:5432/ledgerflow"

# ==========================================
# CONFIGURACIÓN DE LA APP
# ==========================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DEFAULT_CURRENCY="CRC"

# ==========================================
# SEGURIDAD (FUTURO)
# ==========================================
# NEXTAUTH_SECRET="tu_secreto_aqui_minimo_32_caracteres"
# NEXTAUTH_URL="http://localhost:3000"

# ==========================================
# API KEYS EXTERNAS (OPCIONAL)
# ==========================================
# OPENAI_API_KEY="sk-..."
# GEMINI_API_KEY="..."

# ==========================================
# EMAIL (FUTURO)
# ==========================================
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="tu_email@gmail.com"
# SMTP_PASS="tu_app_password"
```

**Explicación de variables:**

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | ✅ | URL de conexión a PostgreSQL |
| `NEXT_PUBLIC_APP_URL` | ✅ | URL pública de la app |
| `DEFAULT_CURRENCY` | ❌ | Moneda por defecto (CRC) |
| `NEXTAUTH_SECRET` | ❌ | Secreto para JWT (generar con `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | ❌ | URL para callbacks de auth |

---

### Paso 4: Configurar Base de Datos

#### Generar Cliente Prisma

```bash
npm run db:generate
```

Esto genera el cliente Prisma con tipos TypeScript.

#### Ejecutar Migraciones

```bash
# Opción A: Migraciones (recomendado para producción)
npm run db:migrate

# Opción B: Push directo (desarrollo rápido)
npx prisma db push
```

**¿Cuál usar?**
- **Migrations**: Cuando necesitas control de versiones del schema
- **db push**: Para desarrollo rápido y prototipos

#### Verificar Conexión

```bash
npx prisma studio
```

Se abrirá Prisma Studio en `http://localhost:5555`

---

### Paso 5: Datos de Prueba

Cargar seed data:

```bash
npm run db:seed
```

**Esto creará:**
- 3 clientes de ejemplo
- 50+ transacciones variadas
- Categorías predefinidas
- Datos para el dashboard

---

### Paso 6: Iniciar Servidor

#### Modo Desarrollo

```bash
npm run dev
```

- Hot reload activado
- Logs detallados
- Mayor tiempo de respuesta

#### Modo Producción (local)

```bash
# Build
npm run build

# Iniciar
npm start
```

- Optimizado para performance
- Sin hot reload
- Logs mínimos

---

## 🧪 Verificación de Instalación

### Checklist

- [ ] Acceder a `http://localhost:3000`
- [ ] Verificar que carga el dashboard
- [ ] Cambiar idioma (ES/EN/FR)
- [ ] Ver gráficos con datos de seed
- [ ] Crear una transacción de prueba
- [ ] Verificar Prisma Studio funciona

### Comandos de Diagnóstico

```bash
# Verificar versión de Node
node --version

# Verificar dependencias
npm list

# Verificar conexión a DB
npx prisma db pull --print

# Lint del código
npm run lint

# Type checking
npm run type-check
```

---

## ⚙️ Configuración Opcional

### Configurar Git Hook (pre-commit)

```bash
# Instalar husky
npx husky-init && npm install

# Crear hook
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
```

### Configurar IDE (VS Code)

Extensiones recomendadas:

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "prisma.prisma",
    "github.copilot"
  ]
}
```

Settings:

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## 🐛 Solución de Problemas

### Error: "Cannot find module 'prisma-client-js'"

**Solución:**
```bash
npm run db:generate
```

### Error: "Connection refused" con PostgreSQL

**Verificar:**
```bash
# PostgreSQL está corriendo?
sudo systemctl status postgresql

# Puerto disponible?
netstat -tlnp | grep 5432

# Usuario existe?
sudo -u postgres psql -c "\du"
```

### Error: "EACCES: permission denied"

**Solución:**
```bash
# Cambiar permisos
sudo chown -R $(whoami) ~/.npm

# O usar npx
npx next dev
```

### Error: "Port 3000 already in use"

**Solución:**
```bash
# Matar proceso en puerto 3000
npx kill-port 3000

# O usar puerto diferente
npm run dev -- --port 3001
```

### Error: "DATABASE_URL must start with prisma://"

**Solución:**
Verificar que DATABASE_URL use el protocolo correcto:
```env
DATABASE_URL="postgresql://usuario:pass@host:5432/dbname"
```

---

## 🚀 Deployment

### Vercel (Recomendado)

1. Conectar repo en [vercel.com](https://vercel.com)
2. Configurar variables de entorno
3. Deploy automático en cada push

### Railway

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Init
railway init

# Deploy
railway up
```

### Docker

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build y run
docker build -t ledgerflow .
docker run -p 3000:3000 --env-file .env.local ledgerflow
```

---

## 📚 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Crear build de producción |
| `npm start` | Iniciar servidor de producción |
| `npm run lint` | Ejecutar ESLint |
| `npm run type-check` | Verificar tipos TypeScript |
| `npm run db:generate` | Generar cliente Prisma |
| `npm run db:migrate` | Ejecutar migraciones |
| `npm run db:seed` | Cargar datos de prueba |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run ingest` | Ejecutar script de ingesta |

---

<div align="center">

**[← Volver al README](./LEDGERFLOW-README.md)**

</div>
