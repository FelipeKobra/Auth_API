import createError from 'http-errors'
import RedefinePasswordTokens from '../Models/RedefinePasswordTokensModel'
import { v4 } from 'uuid'
import { baseUrl } from '../data/URL'
import emailManager from '../libs/emailManager'

const emailManagerInstance = new emailManager()

export default class RedefinePasswordTokensServices {
  public async findTokenyByUserId(userId: number) {
    try {
      const token = await RedefinePasswordTokens.findOne({
        where: { user_id: userId },
      })

      return token
    } catch (error: any) {
      return createError(500, error)
    }
  }

  public async findTokenByToken(token: string) {
    try {
      const tokenObject = await RedefinePasswordTokens.findOne({
        where: { token },
      })

      return tokenObject
    } catch (error: any) {
      return createError(500, error)
    }
  }

  public async createToken(userId: number) {
    try {
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
    } catch (error: any) {
      return createError(500, error)
    }
  }

  public async sendToken(
    receiverEmail: string,
    receiverName: string,
    titulo: 'Token de Confirmação de Email' | 'Token de Recuperação de Senha',
    token: string
  ) {
    try {
      const tokenURL = new URL(baseUrl + `/redefinePassword` + token)

      const emailVizualizer = await emailManagerInstance.sendTokenEmail({
        receiverEmail,
        receiverName,
        titulo,
        tokenURL,
      })

      if (typeof emailVizualizer !== 'string') {
        return createError(500, 'Erro durante envio do email')
      }

      return emailVizualizer
    } catch (error) {
      return createError(500, 'Erro durante o envio do Token')
    }
  }

  public async updateToken(userid: number) {
    try {
      const today = new Date()
      const expireDate = new Date(today.setMinutes(today.getMinutes() + 10))

      let uuidToken = ''

      for (let i = 0; i < 5; i++) {
        uuidToken += v4()
      }

      const newToken = await RedefinePasswordTokens.update(
        {
          token: uuidToken,
          expire_date: expireDate,
        },
        { where: { user_id: userid }, returning: true }
      )

      return newToken[1][0]
    } catch (error) {
      return createError(500, 'Erro durante a criação do token')
    }
  }

  public createTokenURL(token: string) {
    const tokenURL = new URL(baseUrl + `/redefinePassword/token/` + token)
    return tokenURL
  }
}
