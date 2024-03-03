import { config } from 'dotenv'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import GoogleStrategyProvider from './Providers/GoogleStrategyProvider'

config()

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: 'http://localhost:3000/auth/google/callback',
  },
  GoogleStrategyProvider
)

export default googleStrategy
