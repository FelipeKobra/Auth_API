import { ErrorRequestHandler } from 'express'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandlerMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  const message = err.message ? err.message : err
  const status = err.status ? err.status : 500
  res.status(status).json({ error: message })
}

export default errorHandlerMiddleware
