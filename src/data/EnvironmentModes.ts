import { config } from 'dotenv'
config()

export function environmentCases(development: any, production: any) {
  let result
  if (process.env.NODE_ENV === 'development' || 'test') {
    result = development
  } else if (process.env.NODE_ENV === 'production') {
    result = production
  }

  return result
}
