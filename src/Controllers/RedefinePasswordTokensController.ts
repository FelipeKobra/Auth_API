import bcrypt from 'bcrypt'
import { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import RedefinePasswordTokens from '../Models/RedefinePasswordTokensModel'
import User from '../Models/UserModel'
import RedefinePasswordTokensServices from '../Services/RedefinePasswordTokensServices'
import UserService from '../Services/UserServices'
import { baseUrl } from '../data/URL'
import { checkIfPreviousDate } from '../utils/VerifyUtils'

export default class RedefinePasswordTokensController {
  public async sendToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { userid } = req.params

      const user = await UserService.findUserById(parseInt(userid))

      if (!user) return next(createError(400, 'Número de usuário inválido'))

      const token = await RedefinePasswordTokensServices.findTokenyByUserId(
        user.id
      )

      if (!token) {
        const newToken = await RedefinePasswordTokensServices.createToken(
          user.id
        )

        const tokenURL = RedefinePasswordTokensServices.createTokenURL(
          newToken.token
        )

        const emailVizualizer = await RedefinePasswordTokensServices.sendToken(
          user.email,
          user.name,
          tokenURL
        )

        return res.json({
          message: `Redefinição de senha enviada para o seu email, ou pode ser vizualizada nesse link ${emailVizualizer}`,
        })
      }

      const isExpired = checkIfPreviousDate(token.expire_date)

      if (!isExpired) {
        const tokenURL = RedefinePasswordTokensServices.createTokenURL(
          token.token
        )

        const emailVizualizer = await RedefinePasswordTokensServices.sendToken(
          user.email,
          user.name,
          tokenURL
        )

        return res.json({
          message: `O token ainda é válido verifique seu email novamente, ou verifique nesse link ${emailVizualizer}`,
        })
      }

      const newToken = await RedefinePasswordTokensServices.updateToken(user.id)

      const tokenURL = RedefinePasswordTokensServices.createTokenURL(
        newToken.token
      )

      const emailVizualizer = await RedefinePasswordTokensServices.sendToken(
        user.email,
        user.name,
        tokenURL
      )

      return res.json({
        message: `Nova redefinição de senha enviada para o seu email, ou pode ser vizualizada nesse link ${emailVizualizer}`,
      })
    } catch (error: any) {
      throw createError(500, error)
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
        return next(
          createError(
            401,
            'Email incorreto, lembre de adiconar o campo `email`'
          )
        )

      return res.redirect(baseUrl + '/redefinePassword/' + user.id)
    } catch (error: any) {
      throw createError(500, error)
    }
  }

  public async changePassword(req: Request, res: Response) {
    try {
      const { token } = req.params
      const { password }: { password: string | null } = req.body

      const tokenObject =
        await RedefinePasswordTokensServices.findTokenByToken(token)

      if (!tokenObject) throw createError(400, 'Token de Recuperação Inválido')

      const isExpired = checkIfPreviousDate(tokenObject.expire_date)

      if (isExpired) throw createError(401, 'O token não é mais válido')

      if (!password)
        throw createError(
          401,
          "Senha Inválida, lembre de adicionar sua senha no campo 'password' no corpo da requisição"
        )

      if (password.length < 6)
        throw createError(400, 'A senha deve possuir no mínimo 6 caracteres')

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
      throw createError(500, error)
    }
  }
}
