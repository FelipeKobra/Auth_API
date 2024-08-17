import { HttpError } from 'http-errors'
import UserService from '../../Services/UserServices'
import { JwtProviderType } from '../../types/PassportTypes'

export const JwtStrategyProvider: JwtProviderType = async (
  req,
  jwt_payload,
  done
) => {
  try {
    const user = await UserService.findUserById(parseInt(jwt_payload.sub))

    if (user instanceof HttpError) return done(user, false)
    if (user) return done(null, user)

    return done(null, false)
  } catch (error: any) {
    return done(error, false)
  }
}
