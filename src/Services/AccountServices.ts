import createError from 'http-errors'
import Account from '../Models/AccountModel'
import { CreateAccountParams } from '../types/AccountTypes'

export default class AccountServices {
  public static async createAccount({
    provider,
    providerAccountId,
    user_id,
    accessToken,
    refreshToken,
    expiresAt,
    tokenType,
    type,
  }: CreateAccountParams) {
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
  }
}
