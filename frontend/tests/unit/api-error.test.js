const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

class ApiError extends Error {
  constructor(options) {
    super(options.message)
    this.name = 'ApiError'
    this.status = options.status !== undefined ? options.status : 500
    this.code = options.code
    this.errors = options.errors
    this.data = options.data
    this.isNetworkError = options.isNetworkError || false
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

function isApiError(err) {
  return err instanceof ApiError
}

function formatApiErrorMessage(error) {
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

describe('LTTMS ApiError and Normalization Tests', () => {
  it('Creates an ApiError instance with status and error code', () => {
    const error = new ApiError({
      message: 'Account suspended',
      status: 403,
      code: 'ACCOUNT_SUSPENDED',
    })

    assert.equal(isApiError(error), true)
    assert.equal(error.status, 403)
    assert.equal(error.code, 'ACCOUNT_SUSPENDED')
    assert.equal(formatApiErrorMessage(error), 'Account suspended')
  })

  it('Formats validation errors correctly', () => {
    const error = new ApiError({
      message: 'Validation failed',
      status: 400,
      errors: [
        { field: 'email', message: 'Email is invalid' },
        { field: 'password', message: 'Password must be at least 6 characters' },
      ],
    })

    assert.equal(formatApiErrorMessage(error), 'Email is invalid. Password must be at least 6 characters')
  })

  it('Identifies network connectivity errors', () => {
    const error = new ApiError({
      message: 'Unable to reach LTTMS servers',
      status: 0,
      isNetworkError: true,
    })

    assert.equal(error.isNetworkError, true)
    assert.equal(error.status, 0)
  })
})
