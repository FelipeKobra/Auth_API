import { Strategy as LocalStrategy } from 'passport-local'
import { LocalStrategyProvider } from './Providers/LocalStrategyProvider'

const localStrategy = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  LocalStrategyProvider
)

export default localStrategy
