import createError from 'http-errors'
import { v4 } from 'uuid'
import { baseUrl } from '../data/URL'
import emailManager from '../libs/emailManager'
import RedefinePasswordTokens from '../Models/RedefinePasswordTokensModel'

const emailManagerInstance = new emailManager()

export default class RedefinePasswordTokensServices {
  public static async findTokenByUserId(userId: number) {
    if (!userId) {
      throw createError(401, 'Usuário não encontrado')
    }
    const token = await RedefinePasswordTokens.findOne({
      where: { user_id: userId },
    })

    return token
  }

  public static async findTokenByToken(token: string) {
    if (!(token.length > 0)) {
      throw createError(401, 'Token não encontrado')
    }
    const tokenObject = await RedefinePasswordTokens.findOne({
      where: { token },
    })

    return tokenObject
  }

  public static async createToken(userId: number) {
    if (!userId) {
      throw createError(401, 'Usuário não encontrado')
    }
    const today = new Date()
    const expireDate = new Date(today.setMinutes(today.getMinutes() + 10))

    let uuidToken = ''

    for (let i = 0; i < 5; i++) {
      uuidToken += v4()
    }

    return await RedefinePasswordTokens.create({
      expire_date: expireDate,
      token: uuidToken,
      user_id: userId,
    })
  }

  public static async sendToken(
    receiverEmail: string,
    receiverName: string,
    tokenURL: URL
  ) {
    if (
      !(receiverEmail.length > 0) ||
      !(receiverName.length > 0) ||
      !tokenURL
    ) {
      throw createError(401, 'Informações de envio de token inválidas')
    }
    const emailVisualizer = await emailManagerInstance.sendTokenEmail({
      receiverEmail,
      receiverName,
      titulo: 'Token de Recuperação de Senha',
      tokenURL,
      type: 'PasswordReset',
    })

    if (typeof emailVisualizer !== 'string') {
      throw createError(500, 'Erro durante envio do email')
    }

    return emailVisualizer
  }

  public static async updateToken(userId: number) {
    if (!userId) {
      throw createError(401, 'Usuário não encontrado')
    }
    const today = new Date()
    const expireDate = new Date(today.setMinutes(today.getMinutes() + 10))

    let uuidToken = ''

    for (let i = 0; i < 5; i++) {
      uuidToken += v4()
    }

    await RedefinePasswordTokens.update(
      {
        token: uuidToken,
        expire_date: expireDate,
      },
      { where: { user_id: userId } }
    )

    const updatedToken = await RedefinePasswordTokens.findOne({
      where: { user_id: userId },
    })

    if (!updatedToken) {
      throw createError(400, 'Token não encontrado')
    }

    return updatedToken
  }

  public static createTokenURL(token: string) {
    const tokenURL = new URL(baseUrl + `/redefinePassword/token/` + token)
    return tokenURL
  }
}
