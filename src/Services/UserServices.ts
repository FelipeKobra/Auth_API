import bcrypt from 'bcrypt'
import { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { IVerifyOptions } from 'passport-local'
import RefreshToken from '../Models/RefreshTokenModel'
import User from '../Models/UserModel'
import {
  accessTokenCookieName,
  refreshTokenCookieName,
} from '../data/JwtCookieNames'
import { publicKey } from '../data/RSAKeys'
import {
  getCookie,
  removeJwtCookies,
  sendJwtCookie,
} from '../utils/CookiesUtils'
import { signJwt } from '../utils/JwtUtils'
import RefreshTokenService from './RefreshTokenServices'

const refreshTokenService = new RefreshTokenService()

export default class UserService {
  public async ValidatePassword(userPassword: string, password: string) {
    try {
      const validPassword = await bcrypt.compare(password, userPassword)

      return validPassword
    } catch (error: any) {
      throw createError(500, error)
    }
  }

  public validateEmail(email: string) {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return emailRegex.test(email)
  }

  public async Register(name: string, email: string, password: string) {
    let errors = []

    if (!name || name.length < 1) errors.push('Digite um nome válido')
    if (!email) errors.push('Digite seu nome')
    if (!password) errors.push('Digite sua senha')

    if (password && password.length < 6)
      errors.push('A senha deve possuir no mínimo 6 caracteres')
    if (email && !this.validateEmail(email))
      errors.push('Digite um email válido')

    if (errors.length > 0) {
      throw createError(400, errors.join(' | '))
    } else {
      try {
        const hashedPassword = await bcrypt.hash(password, 10)

        const alreadyUser = await User.findOne({ where: { email: email } })

        if (alreadyUser) throw createError(400, 'Email já utilizado')

        await User.create({
          name,
          email,
          password: hashedPassword,
          provider: 'local',
        })

        return { message: 'Usuário Criado com Sucesso', success: true }
      } catch (error: any) {
        throw createError(500, error)
      }
    }
  }

  public async Login(req: Request, res: Response, next: NextFunction) {
    try {
      passport.authenticate(
        'local',
        async (err: Error, user: User, info: IVerifyOptions) => {
          if (err) return next(createError(500, err))

          if (!user) return next(createError(401, info))

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
          return res.json({
            message: 'Login realizado com sucesso',
            token: newAccessToken,
          })
        }
      )(req, res, next)
    } catch (error: any) {
      throw createError(500, error)
    }
  }

  public async Logout(req: Request, res: Response) {
    try {
      const user = req.user

      if (!user)
        throw createError(
          400,
          'Você não está cadastrado para sair de sua conta'
        )

      await refreshTokenService.removeByUserId(user.id)

      removeJwtCookies(res)

      return res.json({ messsage: 'Você saiu da sua conta com sucesso' })
    } catch (error: any) {
      throw createError(500, error)
    }
  }

  public async findUserById(userId: number) {
    try {
      const foundUser = await User.findOne({ where: { id: userId } })

      return foundUser
    } catch (error: any) {
      throw createError(500, error)
    }
  }

  public async returnUserByCookieToken(req: Request) {
    try {
      let user: null | User = null
      const accessToken = getCookie(req, accessTokenCookieName)

      if (accessToken) {
        const parts = accessToken.split('.')
        if (parts.length !== 3) throw createError(400, 'TokenInválido')

        let payload = null

        payload = jwt.verify(accessToken, publicKey)

        if (payload) {
          user = await User.findOne({ where: { id: payload.sub } })
        }
      }
      return user
    } catch (error: any) {
      return null
    }
  }
}
