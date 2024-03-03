import { BaseStrategyOptions } from 'passport-jwt'

export type jwtStrategyOpts = BaseStrategyOptions & {
  secretOrKey: string
  passReqToCallback: true
}

export type jwtPayloadType = {
  iss: string
  sub: string
  aud: string
  exp?: number
}
