import Account from '../../Models/AccountModel'
import User from '../../Models/UserModel'
import { GoogleProviderType } from '../../types/PassportTypes'
import createError from 'http-errors'
import AccountServices from '../../Services/AccountServices'

const GoogleStrategyProvider: GoogleProviderType = async (
  accessToken,
  refreshToken,
  profile,
  done
) => {
  try {
    if (!Array.isArray(profile.emails) || profile.emails.length === 0)
      return done(createError(401, 'Email Inválido'))
    const email = profile.emails[0].value
    const googleId = profile.id

    const foundAccount = await Account.findOne({
      where: { providerAccountId: googleId },
    })

    if (foundAccount) {
      const user = await User.findOne({
        where: { id: foundAccount.user_id },
      })
      if (!user) {
        return done('Não foi encontrado um usuário com esse GoogleId')
      }

      await User.update({ provider: 'google' }, { where: { id: user.id } })
      return done(null, user)
    }

    let user = await User.findOne({ where: { email: email } })

    if (!user) {
      user = await User.create({
        email,
        name: profile.displayName,
        password: null,
        provider: 'google',
      })
    }

    const today = new Date()
    const googleExpireTokenDate = new Date(today.setHours(today.getHours() + 1))
    const googleExpireTokenUnix = Math.floor(
      googleExpireTokenDate.getTime() / 1000
    )

    await AccountServices.createAccount({
      provider: 'google',
      providerAccountId: googleId,
      user_id: user.id,
      accessToken,
      refreshToken,
      expiresAt: googleExpireTokenUnix,
    })

    return done(null, user)
  } catch (error: any) {
    return done(createError(500, error))
  }
}

export default GoogleStrategyProvider
