/**
 * LEDGERFLOW - CONFIGURACIÓN CENTRALIZADA
 * 
 * Este archivo permite configurar la aplicación sin tocar código.
 * Modifica las variables de entorno para personalizar el comportamiento.
 */

// ============================================
// CONFIGURACIÓN GENERAL
// ============================================

export const APP_CONFIG = {
  // Información básica
  name: process.env.NEXT_PUBLIC_APP_NAME || 'LedgerFlow',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Branding
  branding: {
    logo: '/logo.svg',
    favicon: '/favicon.ico',
    primaryColor: '#6366f1',
    accentColor: '#8b5cf6',
  },
  
  // Funcionalidades habilitadas
  features: {
    aiProcessing: process.env.ENABLE_AI_PROCESSING === 'true',
    whatsappNotifications: process.env.ENABLE_WHATSAPP_NOTIFICATIONS === 'true',
    autoReports: process.env.ENABLE_AUTO_REPORTS === 'true',
    emailNotifications: true,
    clientPortal: true,
    kanbanBoard: true,
    financialReports: true,
  },
  
  // Límites del sistema
  limits: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024, // bytes
    maxDocumentsPerMinute: parseInt(process.env.RATE_LIMIT_DOCUMENTS_PER_MINUTE || '10'),
    maxRequestsPerMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '100'),
    maxProjectsFree: 3,
    maxClientsFree: 5,
    maxStorageMBFree: 1000,
  },
  
  // Formatos de archivo soportados
  supportedFormats: {
    documents: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    images: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'],
    spreadsheets: ['xls', 'xlsx', 'csv', 'ods'],
    all: ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'xlsx', 'csv', 'doc', 'docx', 'txt'],
  },
  
  // Monedas soportadas
  currencies: [
    { code: 'EUR', symbol: '€', name: 'Euro', locale: 'es-ES' },
    { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    { code: 'MXN', symbol: '$', name: 'Mexican Peso', locale: 'es-MX' },
    { code: 'COP', symbol: '$', name: 'Colombian Peso', locale: 'es-CO' },
    { code: 'ARS', symbol: '$', name: 'Argentine Peso', locale: 'es-AR' },
  ],
  
  // Idiomas soportados
  languages: [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ],
  
  // Zona horaria por defecto
  defaultTimezone: 'Europe/Madrid',
  
  // Formato de fecha por defecto
  dateFormat: 'DD/MM/YYYY',
  
  // Formato de moneda por defecto
  defaultCurrency: 'EUR',
} as const

// ============================================
// CONFIGURACIÓN DE IA
// ============================================

export const AI_CONFIG = {
  // Proveedor activo
  provider: (process.env.AI_PROVIDER || 'openrouter') as 'openai' | 'openrouter' | 'groq' | 'anthropic',
  
  // Configuración por proveedor
  providers: {
    openrouter: {
      enabled: !!process.env.OPENROUTER_API_KEY,
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      models: {
        default: process.env.OPENROUTER_MODEL || 'mistralai/mixtral-8x7b-instruct',
        vision: process.env.OPENROUTER_VISION_MODEL || 'google/gemini-pro-vision',
      },
      pricing: {
        input: 0.27,  // por 1M tokens
        output: 0.27,
      },
    },
    openai: {
      enabled: !!process.env.OPENAI_API_KEY,
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.openai.com/v1',
      models: {
        default: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        vision: process.env.OPENAI_VISION_MODEL || 'gpt-4o',
      },
      pricing: {
        input: 0.15,
        output: 0.60,
      },
    },
    groq: {
      enabled: !!process.env.GROQ_API_KEY,
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
      models: {
        default: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
        vision: process.env.GROQ_VISION_MODEL || 'llava-v1.5-7b-4096-preview',
      },
      pricing: {
        input: 0.27,
        output: 0.27,
      },
    },
    anthropic: {
      enabled: !!process.env.ANTHROPIC_API_KEY,
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseURL: 'https://api.anthropic.com/v1',
      models: {
        default: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
        vision: process.env.ANTHROPIC_VISION_MODEL || 'claude-3-sonnet-20240229',
      },
      pricing: {
        input: 0.25,
        output: 1.25,
      },
    },
  },
  
  // Configuración de procesamiento
  processing: {
    maxRetries: 3,
    timeoutMs: 30000,
    confidenceThreshold: 0.7,
    enableFallback: true,
    batchSize: 5,
  },
  
  // Tipos de documentos soportados
  documentTypes: [
    'invoice',
    'receipt',
    'expense_report',
    'bank_statement',
    'contract',
    'other',
  ],
} as const

// ============================================
// CONFIGURACIÓN DE NOTIFICACIONES
// ============================================

export const NOTIFICATIONS_CONFIG = {
  email: {
    enabled: !!process.env.RESEND_API_KEY,
    provider: 'resend',
    from: process.env.EMAIL_FROM || 'noreply@ledgerflow.app',
    fromName: process.env.EMAIL_FROM_NAME || 'LedgerFlow',
  },
  
  whatsapp: {
    enabled: process.env.ENABLE_WHATSAPP_NOTIFICATIONS === 'true' && !!process.env.WHATSAPP_API_KEY,
    provider: process.env.WHATSAPP_PROVIDER || 'whatsgw',
    apiKey: process.env.WHATSAPP_API_KEY,
    apiUrl: process.env.WHATSAPP_API_URL,
    phoneNumber: process.env.WHATSAPP_PHONE_NUMBER,
  },
  
  sms: {
    enabled: !!process.env.TWILIO_ACCOUNT_SID,
    provider: 'twilio',
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  
  // Eventos que disparan notificaciones
  events: {
    documentProcessed: true,
    projectCompleted: true,
    newClient: true,
    weeklyReport: false,
    paymentReceived: true,
    paymentOverdue: true,
  },
} as const

// ============================================
// CONFIGURACIÓN DE SEGURIDAD
// ============================================

export const SECURITY_CONFIG = {
  // Autenticación
  auth: {
    sessionDuration: 7 * 24 * 60 * 60, // 7 días en segundos
    refreshTokenDuration: 30 * 24 * 60 * 60, // 30 días
    maxSessionsPerUser: 5,
    requireEmailVerification: false,
    mfaEnabled: false,
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '100'),
    skipSuccessfulRequests: false,
  },
  
  // CORS
  cors: {
    origins: [
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'https://app.ledgerflow.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  
  // Headers de seguridad
  headers: {
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https://*.supabase.co'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },
  
  // Sanitización
  sanitize: {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    allowedAttributes: {
      a: ['href', 'target'],
    },
  },
} as const

// ============================================
// CONFIGURACIÓN DE ALMACENAMIENTO
// ============================================

export const STORAGE_CONFIG = {
  // Supabase Storage
  supabase: {
    bucket: 'documents',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024,
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ],
  },
  
  // Backup (opcional)
  backup: {
    enabled: !!process.env.R2_ACCESS_KEY_ID,
    provider: 'cloudflare-r2',
    bucket: process.env.R2_BUCKET_NAME || 'ledgerflow-backups',
    retentionDays: 30,
  },
  
  // CDN
  cdn: {
    enabled: true,
    baseUrl: process.env.NEXT_PUBLIC_STORAGE_URL,
  },
} as const

// ============================================
// CONFIGURACIÓN DE N8N
// ============================================

export const N8N_CONFIG = {
  enabled: !!process.env.N8N_WEBHOOK_URL,
  webhookUrl: process.env.N8N_WEBHOOK_URL,
  secret: process.env.N8N_SECRET,
  apiKey: process.env.N8N_API_KEY,
  
  // Workflows disponibles
  workflows: {
    documentProcessing: 'document-uploaded',
    weeklyReport: 'weekly-report',
    clientNotification: 'client-notification',
    paymentReminder: 'payment-reminder',
  },
} as const

// ============================================
// HELPERS
// ============================================

/**
 * Obtiene la configuración del proveedor de IA activo
 */
export function getActiveAIProvider() {
  const provider = AI_CONFIG.providers[AI_CONFIG.provider]
  if (!provider || !provider.enabled) {
    // Fallback al primer proveedor disponible
    const available = Object.entries(AI_CONFIG.providers)
      .find(([, config]) => config.enabled)
    if (available) {
      return { name: available[0], config: available[1] }
    }
    throw new Error('No AI provider configured')
  }
  return { name: AI_CONFIG.provider, config: provider }
}

/**
 * Verifica si una función está habilitada
 */
export function isFeatureEnabled(featureName: keyof typeof APP_CONFIG.features): boolean {
  return APP_CONFIG.features[featureName]
}

/**
 * Formatea moneda según configuración
 */
export function formatCurrency(amount: number, currencyCode?: string): string {
  const currency = APP_CONFIG.currencies.find(c => c.code === currencyCode) 
    || APP_CONFIG.currencies.find(c => c.code === APP_CONFIG.defaultCurrency)
  
  if (!currency) return `€${amount.toFixed(2)}`
  
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
  }).format(amount)
}

/**
 * Verifica si un tipo de archivo está permitido
 */
export function isAllowedFileType(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return false
  return APP_CONFIG.supportedFormats.all.includes(ext)
}

// ============================================
// VALIDACIÓN
// ============================================

export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validar variables requeridas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required')
  }
  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET is required for security')
  }
  if (!process.env.WEBHOOK_SECRET) {
    errors.push('WEBHOOK_SECRET is required for webhook security')
  }
  
  // Validar que al menos un proveedor de IA esté configurado
  const hasAIProvider = Object.values(AI_CONFIG.providers).some(p => p.enabled)
  if (!hasAIProvider) {
    errors.push('At least one AI provider must be configured')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}
