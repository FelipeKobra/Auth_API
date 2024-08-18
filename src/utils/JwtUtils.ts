import jwt from 'jsonwebtoken'
import pemjwk from 'pem-jwk'
import { privateKey, publicKey } from '../data/RSAKeys'
import { jwtPayloadType } from '../types/JwtTypes'
import { Request } from 'express'
import { accessTokenCookieName } from '../data/JwtCookieNames'

export function jwtFromRequest(req: Request) {
  let token = null
  if (req && req.cookies) {
    token = req.cookies[accessTokenCookieName]
  }

  if (req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1]
  }

  return token
}

export function validateJwt(token: string) {
  try {
    const decoded = jwt.verify(token, publicKey)
    return decoded
  } catch {
    return null
  }
}

export function signJwt(userId: number, type: 'Access' | 'Refresh') {
  const jwtPayload: jwtPayloadType = {
    aud: 'http://localhost:3000',
    iss: 'http://localhost:3000',
    sub: userId.toString(),
  }

  let expireTime = '1 hour'
  if (type === 'Refresh') expireTime = '30 days'

  const token = jwt.sign(jwtPayload, privateKey, {
    expiresIn: expireTime,
    algorithm: 'RS256',
  })

  return token
}

export function createJwkFromRSA() {
  const JWK = pemjwk.pem2jwk(publicKey)
  JWK.use = 'sig'
  return JWK
}

export function verifyToken(token: string, secret: string) {
  try {
    jwt.verify(token, secret)
    return { token: token, valid: true, expired: false }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { token: token, valid: false, expired: true }
    } else {
      return { token: token, valid: false, expired: false }
    }
  }
}
