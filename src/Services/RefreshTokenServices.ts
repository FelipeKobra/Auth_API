import { Request } from 'express'
import createError from 'http-errors'
import RefreshToken from '../Models/RefreshTokenModel'
import { refreshTokenCookieName } from '../data/JwtCookieNames'
import { getCookie } from '../utils/CookiesUtils'
import { signJwt, validateJwt } from '../utils/JwtUtils'

export default class RefreshTokenService {
  public static async validateRefreshToken(token: string) {
    const validToken = validateJwt(token)
    if (!validToken) return null

    const DatabaseToken = await RefreshToken.findOne({ where: { token } })

    if (!DatabaseToken) return null
    if (!DatabaseToken.user_id) return null
    if (DatabaseToken.expire_date < new Date()) return null

    return DatabaseToken
  }

  public static async update(token: string, userid: number) {
    let hoje = new Date()
    hoje.setMonth(hoje.getMonth() + 1)

    await RefreshToken.update(
      { token, expire_date: hoje },
      { where: { id: userid } }
    )
  }

  public static async create(token: string, userid: number) {
    let hoje = new Date()
    hoje.setMonth(hoje.getMonth() + 1)

    await RefreshToken.create({ user_id: userid, token, expire_date: hoje })
  }

  public static async updateAccessTokenWithRefreshToken(req: Request) {
    const refreshToken = getCookie(req, refreshTokenCookieName)

    if (!refreshToken) return createError(401, 'Não há Refresh Token')

    const validatedRefreshToken = await this.validateRefreshToken(refreshToken)
    if (!validatedRefreshToken) return createError(401, 'Token Inválido')

    const newAcessToken = signJwt(validatedRefreshToken.user_id, 'Access')
    const newRefreshToken = signJwt(validatedRefreshToken.user_id, 'Refresh')

    await this.update(newRefreshToken, validatedRefreshToken.user_id)

    return {
      oldRefreshTokenObject: validatedRefreshToken,
      newAcessToken,
      newRefreshToken,
    }
  }

  public static async removeByUserId(userId: number) {
    await RefreshToken.destroy({ where: { user_id: userId } })
  }
}
