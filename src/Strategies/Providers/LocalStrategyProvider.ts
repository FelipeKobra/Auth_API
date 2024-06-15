import createError from 'http-errors'
import User from '../../Models/UserModel'
import UserService from '../../Services/UserServices'
import { LocalProviderType } from '../../types/PassportTypes'

const userService = new UserService()

export const LocalStrategyProvider: LocalProviderType = async (
  email,
  password,
  done
) => {
  try {
    const foundUser = await User.findOne({ where: { email } })

    if (!foundUser)
      return done(null, false, {
        message: 'Email incorreto',
      })

    if (!foundUser.password) return done(null, false)

    const validPassword = await userService.ValidatePassword(
      foundUser.password,
      password
    )

    if (!validPassword) return done(null, false, { message: 'Senha incorreta' })

    await User.update({ provider: 'local' }, { where: { id: foundUser.id } })
    return done(null, foundUser)
  } catch (error: any) {
    return done(createError(500, error), false)
  }
}
