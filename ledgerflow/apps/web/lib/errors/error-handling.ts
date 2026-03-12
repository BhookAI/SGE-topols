/**
 * LEDGERFLOW - SISTEMA DE MANEJO DE ERRORES ROBUSTO
 */

import { toast } from 'sonner'

export enum ErrorCode {
  AUTH_INVALID_CREDENTIALS = 'AUTH_001',
  AUTH_SESSION_EXPIRED = 'AUTH_002',
  AUTH_UNAUTHORIZED = 'AUTH_003',
  AUTH_FORBIDDEN = 'AUTH_004',
  VALIDATION_INVALID_INPUT = 'VAL_001',
  VALIDATION_MISSING_FIELD = 'VAL_002',
  DB_NOT_FOUND = 'DB_001',
  DB_DUPLICATE = 'DB_002',
  FILE_TOO_LARGE = 'FILE_001',
  FILE_INVALID_TYPE = 'FILE_002',
  AI_PROCESSING_ERROR = 'AI_001',
  AI_TIMEOUT = 'AI_002',
  NETWORK_ERROR = 'NET_001',
  TIMEOUT_ERROR = 'NET_002',
  SERVER_ERROR = 'SRV_001',
  UNKNOWN_ERROR = 'UNK_001',
}

export class AppError extends Error {
  public code: ErrorCode
  public statusCode: number
  public details?: Record<string, any>
  public isOperational: boolean

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: Record<string, any>,
    isOperational: boolean = true
  ) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

const errorMessages: Record<ErrorCode, { title: string; message: string; action?: string }> = {
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: {
    title: 'Credenciales invalidas',
    message: 'El email o contrasena son incorrectos.',
  },
  [ErrorCode.AUTH_SESSION_EXPIRED]: {
    title: 'Sesion expirada',
    message: 'Tu sesion ha expirado. Inicia sesion nuevamente.',
    action: 'Iniciar sesion',
  },
  [ErrorCode.AUTH_UNAUTHORIZED]: {
    title: 'Acceso no autorizado',
    message: 'No tienes permiso para realizar esta accion.',
  },
  [ErrorCode.AUTH_FORBIDDEN]: {
    title: 'Acceso prohibido',
    message: 'No tienes acceso a este recurso.',
  },
  [ErrorCode.VALIDATION_INVALID_INPUT]: {
    title: 'Datos invalidos',
    message: 'Los datos proporcionados no son validos.',
  },
  [ErrorCode.VALIDATION_MISSING_FIELD]: {
    title: 'Campos incompletos',
    message: 'Faltan campos obligatorios.',
  },
  [ErrorCode.DB_NOT_FOUND]: {
    title: 'No encontrado',
    message: 'El recurso solicitado no existe.',
  },
  [ErrorCode.DB_DUPLICATE]: {
    title: 'Registro duplicado',
    message: 'Ya existe un registro con estos datos.',
  },
  [ErrorCode.FILE_TOO_LARGE]: {
    title: 'Archivo muy grande',
    message: 'El archivo excede el tamano maximo permitido.',
  },
  [ErrorCode.FILE_INVALID_TYPE]: {
    title: 'Tipo de archivo no valido',
    message: 'El formato del archivo no esta soportado.',
  },
  [ErrorCode.AI_PROCESSING_ERROR]: {
    title: 'Error de procesamiento',
    message: 'No se pudo procesar el documento.',
    action: 'Reintentar',
  },
  [ErrorCode.AI_TIMEOUT]: {
    title: 'Tiempo de espera agotado',
    message: 'El procesamiento tomo demasiado tiempo.',
    action: 'Reintentar',
  },
  [ErrorCode.NETWORK_ERROR]: {
    title: 'Error de conexion',
    message: 'No se pudo conectar con el servidor.',
    action: 'Reintentar',
  },
  [ErrorCode.TIMEOUT_ERROR]: {
    title: 'Tiempo de espera agotado',
    message: 'La operacion tomo demasiado tiempo.',
    action: 'Reintentar',
  },
  [ErrorCode.SERVER_ERROR]: {
    title: 'Error del servidor',
    message: 'Ocurrio un error interno. Intenta mas tarde.',
  },
  [ErrorCode.UNKNOWN_ERROR]: {
    title: 'Error inesperado',
    message: 'Ocurrio un error inesperado. Intenta nuevamente.',
    action: 'Reintentar',
  },
}

export function getFriendlyError(error: AppError | Error | any) {
  if (error instanceof AppError) {
    const friendly = errorMessages[error.code]
    if (friendly) {
      return { ...friendly, code: error.code }
    }
  }

  if (error?.code?.startsWith('auth/')) {
    return {
      title: 'Error de autenticacion',
      message: 'Hubo un problema con tu sesion.',
      action: 'Iniciar sesion',
      code: ErrorCode.AUTH_SESSION_EXPIRED,
    }
  }

  return {
    title: 'Error inesperado',
    message: error?.message || 'Ocurrio un error inesperado.',
    action: 'Reintentar',
    code: ErrorCode.UNKNOWN_ERROR,
  }
}

export function handleError(error: any, options?: { showToast?: boolean; logToConsole?: boolean }) {
  const { showToast = true, logToConsole = true } = options || {}
  const friendly = getFriendlyError(error)

  if (logToConsole) {
    console.error('[Error]', {
      code: friendly.code,
      title: friendly.title,
      originalError: error,
    })
  }

  if (showToast) {
    toast.error(friendly.title, {
      description: friendly.message,
    })
  }

  return friendly
}

export async function safeFetch<T>(
  url: string,
  options?: RequestInit & { timeout?: number; retries?: number }
): Promise<T> {
  const { timeout = 30000, retries = 3, ...fetchOptions } = options || {}
  let lastError: any

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new AppError(
          ErrorCode.SERVER_ERROR,
          `HTTP ${response.status}`,
          response.status
        )
      }

      return await response.json()
    } catch (error) {
      lastError = error
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError
}
