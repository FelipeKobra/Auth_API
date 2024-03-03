import { NextFunction, Request, Response } from 'express'
import createError, { HttpError } from 'http-errors'
import User from '../Models/UserModel'
import RedefinePasswordTokensServices from '../Services/RedefinePasswordTokensServices'
import UserService from '../Services/UserServices'
import { baseUrl } from '../data/URL'
import { checkIfPreviousDate } from '../utils/VerifyUtils'
import bcrypt from 'bcrypt'
import RedefinePasswordTokens from '../Models/RedefinePasswordTokensModel'

const userService = new UserService()
const redefinePasswordTokensServices = new RedefinePasswordTokensServices()

export default class RedefinePasswordTokensController {
  public async sendToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { userid } = req.params

      const user = await userService.findUserById(parseInt(userid))

      if (user instanceof HttpError) return next(user)

      if (!user) return res.json({ message: 'Número de usuário inválido' })

      const token = await redefinePasswordTokensServices.findTokenyByUserId(
        user.id
      )

      if (token instanceof HttpError) return next(token)

      if (!token) {
        const newToken = await redefinePasswordTokensServices.createToken(
          user.id
        )
        if (newToken instanceof HttpError) return next(newToken)

        const tokenURL = redefinePasswordTokensServices.createTokenURL(
          newToken.token
        )

        const emailVizualizer = await redefinePasswordTokensServices.sendToken(
          user.email,
          user.name,
          tokenURL
        )

        if (emailVizualizer instanceof HttpError) return next(emailVizualizer)

        return res.json({
          message: `Redefinição de senha enviada para o seu email, ou pode ser vizualizada nesse link ${emailVizualizer}`,
        })
      }

      const isExpired = checkIfPreviousDate(token.expire_date)

      if (!isExpired) {
        const tokenURL = redefinePasswordTokensServices.createTokenURL(
          token.token
        )

        const emailVizualizer = await redefinePasswordTokensServices.sendToken(
          user.email,
          user.name,
          tokenURL
        )

        if (emailVizualizer instanceof HttpError) return next(emailVizualizer)

        return res.json({
          message: `O token ainda é válido verifique seu email novamente, ou verifique nesse link ${emailVizualizer}`,
        })
      }

      const newToken = await redefinePasswordTokensServices.updateToken(user.id)

      if (newToken instanceof HttpError) return next(newToken)

      const tokenURL = redefinePasswordTokensServices.createTokenURL(
        newToken.token
      )

      const emailVizualizer = await redefinePasswordTokensServices.sendToken(
        user.email,
        user.name,
        tokenURL
      )

      if (emailVizualizer instanceof HttpError) return next(emailVizualizer)

      return res.json({
        message: `Nova redefinição de senha enviada para o seu email, ou pode ser vizualizada nesse link ${emailVizualizer}`,
      })
    } catch (error: any) {
      next(createError(500, error))
    }
  }

  public async redirectToSendToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email } = req.body

      const user = await User.findOne({ where: { email } })

      if (!user)
        return res.json({
          message: 'Email incorreto, lembre de adiconar o campo `email`',
        })

      return res.redirect(baseUrl + '/redefinePassword/' + user.id)
    } catch (error: any) {
      next(createError(500, error))
    }
  }

  public async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params
      const { password }: { password: string | null } = req.body

      const tokenObject =
        await redefinePasswordTokensServices.findTokenByToken(token)

      if (tokenObject instanceof HttpError) return next(tokenObject)

      if (!tokenObject)
        return next(createError(400, 'Token de Recuperação Inválido'))

      const isExpired = checkIfPreviousDate(tokenObject.expire_date)

      if (isExpired) return next(createError(401, 'O token não é mais válido'))

      if (!password)
        return next(
          createError(
            401,
            "Senha Inválida, lembre de adicionar sua senha no campo 'password' no corpo da requisição"
          )
        )

      if (password.length < 6)
        return next(
          createError(400, 'A senha deve possuir no mínimo 6 caracteres')
        )

      const hashedPassword = await bcrypt.hash(password, 10)

      await Promise.all([
        User.update(
          { password: hashedPassword },
          { where: { id: tokenObject.user_id } }
        ),
        RedefinePasswordTokens.destroy({
          where: { user_id: tokenObject.user_id },
        }),
      ])

      return res.json({ message: 'Senha alterada com sucesso!' })
    } catch (error: any) {
      return next(createError(500, error))
    }
  }
}
