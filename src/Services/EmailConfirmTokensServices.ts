import createError from 'http-errors'
import { v4 } from 'uuid'
import EmailConfirmToken from '../Models/EmailConfirmTokenModel'
import emailManager from '../libs/emailManager'
import { baseUrl } from '../data/URL'
const emailManagerInstance = new emailManager()

export default class EmailConfirmTokenService {
  public async sendToken(
    receiverEmail: string,
    receiverName: string,
    token: string
  ) {
    try {
      const tokenURL = new URL(baseUrl + `/confirmEmail/token/${token}`)

      const emailVizualizer = await emailManagerInstance.sendTokenEmail({
        receiverEmail,
        receiverName,
        titulo:'Token de Confirmação de Email',
        tokenURL,
        type: 'EmailConfirm',
      })

      if (typeof emailVizualizer !== 'string') {
        return createError(500, 'Falha durante o envio do email')
      }

      return emailVizualizer
    } catch (error) {
      return createError(500, 'Erro durante o envio do Token')
    }
  }

  public async createToken(userid: number) {
    try {
      const today = new Date()
      const expireDate = new Date(today.setMinutes(today.getMinutes() + 10))

      const token = v4()

      const newToken = await EmailConfirmToken.create({
        user_id: userid,
        token,
        expire_date: expireDate,
      })

      return { tokenObject: newToken, expired: false }
    } catch (error) {
      return createError(500, 'Erro durante a criação do token')
    }
  }

  public async updateToken(userid: number) {
    try {
      const today = new Date()
      const expireDate = new Date(today.setMinutes(today.getMinutes() + 10))

      const token = v4()

      const newToken = await EmailConfirmToken.update(
        {
          token,
          expire_date: expireDate,
        },
        { where: { user_id: userid }, returning: true }
      )

      return { tokenObject: newToken[1][0], expired: false }
    } catch (error) {
      return createError(500, 'Erro durante a criação do token')
    }
  }

  public async searchTokenByUserId(userid: number) {
    // Retornará false quando precisar criar um token no Controller
    try {
      const foundToken = await EmailConfirmToken.findOne({
        where: { user_id: userid },
      })

      //caso nao tenha token = false
      if (!foundToken) return null

      //caso o token tenha expirado = trocar o token e data de expiração e devolver true
      if (foundToken.expire_date < new Date()) {
        return { tokenObject: foundToken, expired: true }
      } else {
        return { tokenObject: foundToken, expired: false }
      }
    } catch (error) {
      return createError(500, 'Erro durante validação do Token')
    }
  }

  public async searchTokenByToken(token: string) {
    try {
      const tokenObject = await EmailConfirmToken.findOne({ where: { token } })
      if (!tokenObject) return null
      return tokenObject
    } catch (error: any) {
      return createError(500, error)
    }
  }
}
