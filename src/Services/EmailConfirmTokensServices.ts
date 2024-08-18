import createError from 'http-errors'
import { v4, validate } from 'uuid'
import EmailConfirmToken from '../Models/EmailConfirmTokenModel'
import { baseUrl } from '../data/URL'
import emailManager from '../libs/emailManager'
const emailManagerInstance = new emailManager()

export default class EmailConfirmTokenService {
  public static async sendToken(
    receiverEmail: string,
    receiverName: string,
    token: string
  ) {
    if (!validate(token)) {
      throw createError(401, 'Token de confirmação inválido')
    }

    const tokenURL = new URL(baseUrl + `/confirmEmail/token/${token}`)

    const emailVizualizer = await emailManagerInstance.sendTokenEmail({
      receiverEmail,
      receiverName,
      titulo: 'Token de Confirmação de Email',
      tokenURL,
      type: 'EmailConfirm',
    })

    if (typeof emailVizualizer !== 'string') {
      throw createError(500, 'Falha durante o envio do email')
    }

    return emailVizualizer
  }

  public static async createToken(userid: number) {
    if (!userid) {
      throw createError(401, 'Usuário inválido')
    }
    const today = new Date()
    const expireDate = new Date(today.setMinutes(today.getMinutes() + 10))

    const token = v4()

    const newToken = await EmailConfirmToken.create({
      user_id: userid,
      token,
      expire_date: expireDate,
    })

    return { tokenObject: newToken, expired: false }
  }

  public static async updateToken(userid: number) {
    if (!userid) {
      throw createError(401, 'Usuário inválido')
    }
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
  }

  public static async searchTokenByUserId(userid: number) {
    // Retornará false quando precisar criar um token no Controller

    if (!userid) {
      throw createError(401, 'Usuário inválido')
    }

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
  }

  public static async searchTokenByToken(token: string) {
    if (!token) {
      throw createError(401, 'Token inválido')
    }
    const tokenObject = await EmailConfirmToken.findOne({ where: { token } })
    if (!tokenObject) return null
    return tokenObject
  }
}
