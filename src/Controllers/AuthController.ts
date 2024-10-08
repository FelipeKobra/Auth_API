import { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import passport from 'passport'
import { IVerifyOptions } from 'passport-local'
import RefreshToken from '../Models/RefreshTokenModel'
import User from '../Models/UserModel'
import RefreshTokenService from '../Services/RefreshTokenServices'
import {
  accessTokenCookieName,
  refreshTokenCookieName,
} from '../data/JwtCookieNames'
import { sendJwtCookie } from '../utils/CookiesUtils'
import { signJwt } from '../utils/JwtUtils'
import checkIfCustomError from '../utils/checkIfCustomError'

export default class AuthController {
  public async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      passport.authenticate(
        'google',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async function (err: Error, user: User | null, info: IVerifyOptions) {
          if (err) return next(createError(400, 'Erro durante a autenticação'))

          if (!user)
            return res
              .status(400)
              .json({ message: 'A autenticação falhou, tente novamente' })

          const newAccessToken = signJwt(user.id, 'Access')
          const newRefreshToken = signJwt(user.id, 'Refresh')

          const alreadyRefreshToken = await RefreshToken.findOne({
            where: { user_id: user.id },
          })

          if (alreadyRefreshToken) {
            await RefreshTokenService.update(newRefreshToken, user.id)
          } else {
            await RefreshTokenService.create(newRefreshToken, user.id)
          }

          sendJwtCookie(res, accessTokenCookieName, newAccessToken, 'Access')
          sendJwtCookie(res, refreshTokenCookieName, newRefreshToken, 'Refresh')
          res.json({
            message: 'Login realizado com sucesso',
            token: newAccessToken,
          })
          return next()
        }
      )(req, res, next)
    } catch (error: any) {
      checkIfCustomError(error)
    }
  }
}
