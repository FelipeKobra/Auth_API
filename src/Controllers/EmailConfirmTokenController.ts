import { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import EmailConfirmToken from '../Models/EmailConfirmTokenModel'
import User from '../Models/UserModel'
import EmailConfirmTokenService from '../Services/EmailConfirmTokensServices'
import UserService from '../Services/UserServices'

const userServices = new UserService()
const emailConfirmToken = new EmailConfirmTokenService()

export default class EmailConfirmTokenController {
  public async sendEmailToken(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findOne({ where: { id: req.params.userid } })

      if (!user)
        return next(
          createError(401, 'Confirmação apenas para usuários cadastrados')
        )

      if (user.confirmed === true) {
        return next(createError(400, 'Seu email já foi autenticado'))
      }

      let foundToken = await emailConfirmToken.searchTokenByUserId(user.id)

      if (foundToken && !foundToken.expired && foundToken.tokenObject) {
        return res.json({
          message: `O token enviado previamente ainda é válido, verifique sua caixa de mensagem ou entre nessa URL: ${(foundToken.tokenObject as EmailConfirmToken).emailVizualizer}`,
        })
      } else if (foundToken && foundToken.expired && foundToken.tokenObject) {
        foundToken = await emailConfirmToken.updateToken(user.id)
      }

      if (!foundToken) {
        foundToken = await emailConfirmToken.createToken(user.id)
      }

      const emailVizualizer = await emailConfirmToken.sendToken(
        user.email,
        user.name,
        foundToken.tokenObject.token
      )

      if (typeof emailVizualizer === 'string') {
        await EmailConfirmToken.update(
          { emailVizualizer },
          { where: { user_id: user.id } }
        )

        return res.json({
          message: `Confirme seu email para continuar. Um token foi enviado para seu email, ou pode ser vizualizado nessa URL em caso de teste: ${emailVizualizer}`,
        })
      } else {
        return next(emailVizualizer)
      }
    } catch (error: any) {
      return next(createError(500, error))
    }
  }

  public async confirmToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token

      const foundToken = await emailConfirmToken.searchTokenByToken(token)

      if (!foundToken) throw createError(400, 'Token Inválido')

      const user = await userServices.findUserById(foundToken.user_id)

      if (!user) throw createError(400, 'Token Inválido')

      if (user.confirmed === true) {
        await EmailConfirmToken.destroy({
          where: { user_id: user.id },
        })
        return res.json({ message: 'Usuário já está autenticado' })
      }

      await Promise.all([
        User.update({ confirmed: true }, { where: { id: user.id } }),
        EmailConfirmToken.destroy({ where: { user_id: user.id } }),
      ])

      return res.json({ message: 'Usuário autenticado com sucesso!' })
    } catch (error: any) {
      return next(createError(500, error))
    }
  }
}
