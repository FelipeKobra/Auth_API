import { config } from 'dotenv'
config()

export const accessTokenCookieName = process.env.ACCESS_COOKIE_NAME as string
export const refreshTokenCookieName = process.env.REFRESH_COOKIE_NAME as string
