/**
 * Normalized API Error Class for LTTMS
 */
export interface ValidationErrorItem {
  field?: string
  message: string
}

export class ApiError extends Error {
  public status: number
  public code?: string
  public errors?: ValidationErrorItem[]
  public data?: any
  public isNetworkError: boolean
  public response?: { data?: any; status?: number }

  constructor(options: {
    message: string
    status?: number
    code?: string
    errors?: ValidationErrorItem[]
    data?: any
    isNetworkError?: boolean
    response?: { data?: any; status?: number }
  }) {
    super(options.message)
    this.name = 'ApiError'
    this.status = options.status !== undefined ? options.status : 500
    this.code = options.code
    this.errors = options.errors
    this.data = options.data
    this.isNetworkError = options.isNetworkError || false
    this.response = options.response || (options.data !== undefined ? { data: options.data, status: options.status } : undefined)

    // Maintain prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function formatApiErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.errors && error.errors.length > 0) {
      return error.errors.map((e) => e.message).join('. ')
    }
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred. Please try again.'
}
