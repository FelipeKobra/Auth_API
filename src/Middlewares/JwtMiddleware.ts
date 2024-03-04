import createError, { HttpError } from 'http-errors'
import passport from 'passport'
import { IVerifyOptions } from 'passport-local'
import User from '../Models/UserModel'
import RefreshTokenService from '../Services/RefreshTokenServices'
import {
  accessTokenCookieName,
  refreshTokenCookieName,
} from '../data/JwtCookieNames'
import { MiddlewareType } from '../types/RoutesTypes'
import { sendJwtCookie } from '../utils/CookiesUtils'
const refreshTokenService = new RefreshTokenService()

export const JwtMiddleware: MiddlewareType = async (req, res, next) => {
  try {
    passport.authenticate(
      'jwt',
      { session: false },
      async (err: Error, user: User | null, info: IVerifyOptions) => {
        if (err) return next(createError(500, err))

        if (!user) {
          if (
            info.message === 'TokenExpiredError' ||
            info.message === 'jwt expired'
          ) {
            const NewTokens =
              await refreshTokenService.updateAccessTokenWithRefreshToken(req)

            if (NewTokens instanceof HttpError) return next(NewTokens)
            if (NewTokens.oldRefreshTokenObject instanceof HttpError)
              return next(NewTokens.oldRefreshTokenObject)

            sendJwtCookie(
              res,
              accessTokenCookieName,
              NewTokens.newAcessToken,
              'Access'
            )
            sendJwtCookie(
              res,
              refreshTokenCookieName,
              NewTokens.newRefreshToken,
              'Refresh'
            )

            const user = await User.findOne({
              where: { id: NewTokens.oldRefreshTokenObject.user_id },
            })
            if (!user) return next(createError(400, 'Usuário Não Existente'))

            req.user = user

            if (req.path === '/logout') return next()

            if (
              (user.provider === 'local' || !user.provider) &&
              !user.confirmed
            ) {
              return res.redirect(`/confirmEmail/${user.id}`)
            }

            console.log({ message: 'Refresh Token autenticado com sucesso' })
            return next()
          } else {
            return next(createError(401, 'Erro na validação do token'))
          }
        }

        //Caso o usuário exista
        req.user = user

        if (req.path === '/logout') return next()

        if (!user.confirmed) {
          return res.redirect(`/confirmEmail/${user.id}`)
        }

        console.log({ message: 'Token autenticado com sucesso' })
        return next()
      }
    )(req, res, next)
  } catch (error: any) {
    return next(createError(500, error))
  }
}
