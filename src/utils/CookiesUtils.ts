import { Request, Response } from 'express'

export function getCookie(req: Request, name: string) {
  let token: null | string = null
  if (req && req.cookies) token = req.cookies[name]
  return token
}

export function sendJwtCookie(
  res: Response,
  name: string,
  payload: any,
  type: 'Access' | 'Refresh'
) {
  let maxAgeValue = 1000 * 60 * 60
  if (type === 'Refresh') maxAgeValue = 1000 * 60 * 60 * 24 * 30

  res.cookie(name, payload, { maxAge: maxAgeValue, httpOnly: true })
}
