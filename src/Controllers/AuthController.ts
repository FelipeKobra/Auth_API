import createError from 'http-errors'
import { NextFunction, Request, Response } from 'express'
import passport from 'passport'
import User from '../Models/UserModel'
import { IVerifyOptions } from 'passport-local'
import { signJwt } from '../utils/JwtUtils'
import RefreshToken from '../Models/RefreshTokenModel'
import {
  accessTokenCookieName,
  refreshTokenCookieName,
} from '../data/JwtCookieNames'
import { sendJwtCookie } from '../utils/CookiesUtils'
import RefreshTokenService from '../Services/RefreshTokenServices'

const refreshTokenService = new RefreshTokenService()

export default class AuthController {
  public async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      passport.authenticate(
        'google',
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
            await refreshTokenService.update(newRefreshToken, user.id)
          } else {
            await refreshTokenService.create(newRefreshToken, user.id)
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
      next(createError(500, error))
    }
  }
}
