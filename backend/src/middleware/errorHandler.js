export class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    })
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    })
  }

  if (err.name === 'CastError') {
    const message = 'Resource not found'
    return res.status(404).json({
      success: false,
      status: 'fail',
      message,
    })
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Validation Error',
      errors,
    })
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    return res.status(400).json({
      success: false,
      status: 'fail',
      message,
    })
  }

  console.error('ERROR:', err)

  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went wrong',
  })
}

export const notFound = (req, res, next) => {
  const err = new AppError(`Route ${req.originalUrl} not found`, 404)
  next(err)
}

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
