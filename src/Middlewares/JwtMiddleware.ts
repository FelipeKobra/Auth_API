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
              await RefreshTokenService.updateAccessTokenWithRefreshToken(req)

            if (NewTokens instanceof HttpError) return next(NewTokens)

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

            return next()
          } else {
            return next(
              createError(
                401,
                'Erro na validação do token, verifique se está em sua conta para acessar a rota'
              )
            )
          }
        }

        //Caso o usuário exista
        req.user = user

        if (req.path === '/logout') return next()

        if (!user.confirmed) {
          return res.redirect(`/confirmEmail/${user.id}`)
        }

        return next()
      }
    )(req, res, next)
  } catch (error: any) {
    throw createError(500, error)
  }
}
