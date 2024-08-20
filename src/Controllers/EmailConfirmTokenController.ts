import { Request, Response } from 'express'
import createError from 'http-errors'
import EmailConfirmToken from '../Models/EmailConfirmTokenModel'
import User from '../Models/UserModel'
import EmailConfirmTokenService from '../Services/EmailConfirmTokensServices'
import UserService from '../Services/UserServices'
import checkIfCustomError from '../utils/checkIfCustomError'

export default class EmailConfirmTokenController {
  public async sendEmailToken(req: Request, res: Response) {
    try {
      const user = await User.findOne({ where: { id: req.params.userid } })

      if (!user)
        throw createError(401, 'Confirmação apenas para usuários cadastrados')

      if (user.confirmed === true) {
        throw createError(400, 'Seu email já foi autenticado')
      }

      let foundToken = await EmailConfirmTokenService.searchTokenByUserId(
        user.id
      )

      if (foundToken && !foundToken.expired && foundToken.tokenObject) {
        return res.json({
          message: `O token enviado previamente ainda é válido, verifique sua caixa de mensagem ou entre nessa URL: ${(foundToken.tokenObject as EmailConfirmToken).emailVisualizer}`,
        })
      } else if (foundToken && foundToken.expired && foundToken.tokenObject) {
        foundToken = await EmailConfirmTokenService.updateToken(user.id)
      }

      if (!foundToken) {
        foundToken = await EmailConfirmTokenService.createToken(user.id)
      }

      const emailVizualizer = await EmailConfirmTokenService.sendToken(
        user.email,
        user.name,
        foundToken.tokenObject.token
      )

      await EmailConfirmToken.update(
        { emailVisualizer: emailVizualizer },
        { where: { user_id: user.id } }
      )

      return res.json({
        message: `Confirme seu email para continuar. Um token foi enviado para seu email, ou pode ser vizualizado nessa URL em caso de teste: ${emailVizualizer}`,
      })
    } catch (error: any) {
      checkIfCustomError(error)
    }
  }

  public async confirmToken(req: Request, res: Response) {
    try {
      const token = req.params.token

      const foundToken =
        await EmailConfirmTokenService.searchTokenByToken(token)

      if (!foundToken) throw createError(400, 'Token Inválido')

      const user = await UserService.findUserById(foundToken.user_id)

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
      checkIfCustomError(error)
    }
  }
}
