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

async function apiClient<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  console.log(`[API Client] Request to ${url}`)

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    const json: ApiResponse<T> = await response.json()

    if (!response.ok || !json.success) {
      console.error(`[API Client] Error response from ${url}:`, json.error)
      throw new ApiClientError(
        json.error?.code || "UNKNOWN_ERROR",
        json.error?.message || "Error desconocido",
        json.error?.details
      )
    }

    console.log(`[API Client] Success response from ${url}`)

    return json.data as T
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }

    console.error(`[API Client] Network error for ${url}:`, error)
    throw new ApiClientError(
      "NETWORK_ERROR",
      "Error de conexión con el servidor"
    )
  }
}

export { apiClient, ApiClientError }
export type { ApiResponse, ApiError }
