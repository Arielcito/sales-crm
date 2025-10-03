import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios'

interface ApiError {
  code: string
  message: string
  details?: string[]
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: {
    total?: number
    page?: number
    perPage?: number
    totalPages?: number
  }
}

class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: string[]
  ) {
    super(message)
    this.name = "ApiClientError"
  }
}

const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: '', // Se puede configurar una base URL si es necesario
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 segundos de timeout
  })

  // Request interceptor para logging
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      console.log(`[API Client] Request to ${config.url}`)
      return config
    },
    (error: AxiosError) => {
      console.error('[API Client] Request error:', error)
      return Promise.reject(error)
    }
  )

  // Response interceptor para manejo de respuestas y errores
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const json: ApiResponse<unknown> = response.data

      if (!json.success) {
        console.error(`[API Client] Error response from ${response.config.url}:`, json.error)
        throw new ApiClientError(
          json.error?.code || "UNKNOWN_ERROR",
          json.error?.message || "Error desconocido",
          json.error?.details
        )
      }

      console.log(`[API Client] Success response from ${response.config.url}`)
      return response
    },
    (error: AxiosError) => {
      if (error.response) {
        // Error de respuesta del servidor
        const json = error.response.data as ApiResponse<unknown>
        console.error(`[API Client] Server error for ${error.config?.url}:`, json.error)
        throw new ApiClientError(
          json?.error?.code || "SERVER_ERROR",
          json?.error?.message || "Error del servidor",
          json?.error?.details
        )
      } else if (error.request) {
        // Error de red (no hay respuesta)
        console.error(`[API Client] Network error for ${error.config?.url}:`, error.message)
        throw new ApiClientError(
          "NETWORK_ERROR",
          "Error de conexión con el servidor"
        )
      } else {
        // Otro tipo de error
        console.error('[API Client] Unknown error:', error.message)
        throw new ApiClientError(
          "UNKNOWN_ERROR",
          error.message || "Error desconocido"
        )
      }
    }
  )

  return instance
}

const apiClientInstance = createApiClient()

async function apiClient<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const config: AxiosRequestConfig = {
    method: options?.method || 'GET',
    data: options?.body ? JSON.parse(options.body as string) : undefined,
  }

  const response = await apiClientInstance.request<ApiResponse<T>>({
    url,
    ...config,
  })

  return response.data.data as T
}

export { apiClient, ApiClientError, apiClientInstance }
export type { ApiResponse, ApiError }
