import { IVerifyOptions } from 'passport-local'
import { jwtPayloadType } from './JwtTypes'
import { Request } from 'express'
import { Profile, VerifyCallback } from 'passport-google-oauth20'

type doneType = (
  error: any,
  user?: false | Express.User | undefined,
  options?: IVerifyOptions | undefined
) => void

//Providers
export type LocalProviderType = (
  email: string,
  password: string,
  done: doneType
) => any

export type JwtProviderType = (
  req: Request,
  jwt_payload: jwtPayloadType,
  done: doneType
) => any

export type GoogleProviderType = (
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: VerifyCallback
) => Promise<void>
