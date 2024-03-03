import { HttpError } from 'http-errors'
import UserService from '../../Services/UserServices'
import { JwtProviderType } from '../../types/PassportTypes'

const userService = new UserService()

export const JwtStrategyProvider: JwtProviderType = async (
  req,
  jwt_payload,
  done
) => {
  try {
    const user = await userService.findUserById(parseInt(jwt_payload.sub))

    if (user instanceof HttpError) return done(user, false)
    if (user) return done(null, user)

    return done(null, false)
  } catch (error: any) {
    return done(error, false)
  }
}
