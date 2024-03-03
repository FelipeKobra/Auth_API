import createError from 'http-errors'
import Account from '../Models/AccountModel'
import { CreateAccountParams } from '../types/AccountTypes'

export default class AccountServices {
  public async createAccount({
    provider,
    providerAccountId,
    user_id,
    accessToken,
    refreshToken,
    expiresAt,
    tokenType,
    type,
  }: CreateAccountParams) {
    try {
      if (!tokenType) tokenType = 'Bearer'
      if (!type) type = 'oauth'
      await Account.create({
        provider,
        providerAccountId,
        user_id,
        accessToken,
        refreshToken,
        expiresAt,
        tokenType,
        type,
      })
    } catch (error: any) {
      return createError(500, error)
    }
  }
}
