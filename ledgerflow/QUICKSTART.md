# LEDGERFLOW - GUÍA DE CONFIGURACIÓN NO-CODE

**Configura tu SaaS en minutos sin tocar código**

---

## ⚡ CONFIGURACIÓN RÁPIDA (5 minutos)

### Paso 1: Crear cuenta en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un proyecto nuevo
3. Guarda la **URL** y **Anon Key** (Settings > API)
4. Guarda la **Service Role Key** (misma página, panel derecho)

### Paso 2: Ejecutar el Schema SQL
1. En Supabase, ve al **SQL Editor**
2. Crea una **New query**
3. Copia todo el contenido de `packages/database/schema.sql`
4. Click en **Run**
5. ✅ Listo, base de datos configurada

### Paso 3: Crear Storage Bucket
1. Ve a **Storage** en Supabase
2. Click **New bucket**
3. Nombre: `documents`
4. ✅ Public bucket: **NO** (mantener privado)
5. Click **Create bucket**

### Paso 4: Configurar Variables de Entorno
1. Copia `apps/web/.env.local.example` a `apps/web/.env.local`
2. Completa los valores de Supabase
3. Genera secrets seguros (ver abajo)

### Paso 5: Desplegar
```bash
# Local
npm run dev

# Producción (Vercel)
vercel --prod
```

---

## 🔐 GENERAR SECRETS SEGUROS

Abre tu terminal y ejecuta:

```bash
# Para JWT_SECRET, WEBHOOK_SECRET, N8N_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado en tu `.env.local`

---

## 🤖 CONFIGURACIÓN DE IA (ELIGE UNO)

### Opción A: OpenRouter (RECOMENDADO - Más barato)
1. Crea cuenta en [openrouter.ai](https://openrouter.ai)
2. Genera API Key
3. En `.env.local`:
```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-tu-api-key
OPENROUTER_MODEL=mistralai/mixtral-8x7b-instruct
OPENROUTER_VISION_MODEL=google/gemini-pro-vision
```
**Costo:** ~$0.27 por 1M tokens

### Opción B: OpenAI (Mejor calidad)
1. Crea cuenta en [platform.openai.com](https://platform.openai.com)
2. Genera API Key
3. En `.env.local`:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-tu-api-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_VISION_MODEL=gpt-4o
```
**Costo:** ~$0.15-0.60 por 1M tokens

### Opción C: Groq (Ultra rápido)
1. Crea cuenta en [console.groq.com](https://console.groq.com)
2. Genera API Key
3. En `.env.local`:
```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk-tu-api-key
GROQ_MODEL=mixtral-8x7b-32768
GROQ_VISION_MODEL=llava-v1.5-7b-4096-preview
```
**Costo:** ~$0.27 por 1M tokens

---

## 📧 CONFIGURACIÓN DE EMAIL (Opcional)

### Usar Resend (RECOMENDADO - Gratis hasta 3000/mes)
1. Crea cuenta en [resend.com](https://resend.com)
2. Verifica tu dominio
3. Genera API Key
4. En `.env.local`:
```env
RESEND_API_KEY=re_tu-api-key
EMAIL_FROM=noreply@tudominio.com
EMAIL_FROM_NAME=Tu Empresa
```

---

## 💬 CONFIGURACIÓN DE WHATSAPP (Opcional)

### Opción A: WhatsGW (Latinoamérica)
1. Crea cuenta en [whatsgw.com.br](https://whatsgw.com.br)
2. Compra créditos
3. En `.env.local`:
```env
ENABLE_WHATSAPP_NOTIFICATIONS=true
WHATSAPP_PROVIDER=whatsgw
WHATSAPP_API_KEY=tu-api-key
WHATSAPP_API_URL=https://api.whatsgw.com.br
WHATSAPP_PHONE_NUMBER=tu-numero
```

---

## ⚙️ PERSONALIZACIÓN SIN CÓDIGO

### Cambiar Nombre y Branding
Edita `apps/web/lib/config/app-config.ts`:
```typescript
export const APP_CONFIG = {
  name: 'Tu Empresa',
  branding: {
    primaryColor: '#tu-color',
    logo: '/tu-logo.svg',
  },
}
```

### Habilitar/Deshabilitar Funcionalidades
En tu `.env.local`:
```env
# Procesamiento con IA
ENABLE_AI_PROCESSING=true

# Notificaciones WhatsApp
ENABLE_WHATSAPP_NOTIFICATIONS=false

# Reportes automáticos semanales
ENABLE_AUTO_REPORTS=false

# Modo debug (más logs)
DEBUG_MODE=false
```

### Cambiar Límites del Sistema
```env
# Tamaño máximo de archivo (MB)
MAX_FILE_SIZE_MB=10

# Documentos por minuto
RATE_LIMIT_DOCUMENTS_PER_MINUTE=10

# Requests por minuto
RATE_LIMIT_REQUESTS_PER_MINUTE=100
```

### Agregar Monedas
Edita `lib/config/app-config.ts`:
```typescript
currencies: [
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'es-ES' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  // Agrega más aquí
]
```

### Cambiar Idiomas Disponibles
```typescript
languages: [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  // Agrega más aquí
]
```

---

## 🔒 SEGURIDAD OBLIGATORIA

### Variables REQUERIDAS para producción:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Seguridad
JWT_SECRET=generar-con-comando-de-arriba
WEBHOOK_SECRET=generar-con-comando-de-arriba

# Al menos un proveedor de IA
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=tu-key
```

---

## 🚀 DESPLIEGUE EN VERCEL (Recomendado)

### Paso 1: Crear proyecto
1. Ve a [vercel.com](https://vercel.com)
2. Importa tu repositorio de GitHub
3. Selecciona el directorio `apps/web`

### Paso 2: Configurar variables de entorno
1. En Vercel Dashboard > Settings > Environment Variables
2. Agrega TODAS las variables del `.env.local`
3. Click **Save**

### Paso 3: Deploy
1. Click **Deploy**
2. ✅ Listo en ~2 minutos

---

## 🧪 VERIFICAR INSTALACIÓN

Abre tu navegador y verifica:

1. **Landing page:** `https://tu-app.vercel.app`
2. **Login:** Ingresa con credenciales demo
3. **Dashboard:** Debe cargar estadísticas
4. **Upload:** Prueba subir un PDF

### Credenciales de Demo:
- **Admin:** admin@demo.com / cualquier contraseña
- **Código cliente:** DEMO-2026-ABC

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "No AI provider configured"
→ Configura al menos un proveedor de IA en `.env.local`

### Error: "Unauthorized" en API
→ Verifica que `JWT_SECRET` esté configurado

### Error: "Cannot connect to database"
→ Verifica las credenciales de Supabase

### Error: "Storage bucket not found"
→ Crea el bucket `documents` en Supabase Storage

### Los cambios no se ven
→ Recarga con `Ctrl+Shift+R` (limpia caché)

---

## 📞 SOPORTE

**Documentación:** Ver `README.md` y `SECURITY_AUDIT.md`
**Reportar bugs:** Crear issue en GitHub
**Email de soporte:** support@ledgerflow.app

---

## ✅ CHECKLIST PRE-LANZAMIENTO

- [ ] Variables de entorno configuradas
- [ ] Schema SQL ejecutado en Supabase
- [ ] Storage bucket creado
- [ ] Proveedor de IA configurado
- [ ] Email configurado (opcional pero recomendado)
- [ ] Secrets generados y seguros
- [ ] Deploy en Vercel exitoso
- [ ] Pruebas con credenciales demo
- [ ] SSL/HTTPS funcionando
- [ ] Políticas RLS activadas

---

**¡Listo para lanzar! 🚀**

Tiempo estimado de configuración: **15-30 minutos**
