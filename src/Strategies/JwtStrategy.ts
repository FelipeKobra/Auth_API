import { Strategy as JwtStrategy } from 'passport-jwt'
import { publicKey } from '../data/RSAKeys'
import { jwtStrategyOpts } from '../types/JwtTypes'
import { jwtFromRequest } from '../utils/JwtUtils'
import { JwtStrategyProvider } from './Providers/JwtStrategyProvider'

const opts: jwtStrategyOpts = {
  jwtFromRequest: jwtFromRequest,
  secretOrKey: publicKey,
  algorithms: ['RS256'],
  passReqToCallback: true,
}

const jwtStrategy = new JwtStrategy(opts, JwtStrategyProvider)

export default jwtStrategy
