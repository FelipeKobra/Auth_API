import { config } from 'dotenv'
config()

export function environmentCases(development: any, production: any) {
  let result
  if (['development', 'test'].includes(process.env.NODE_ENV as string)) {
    result = development
  } else if (process.env.NODE_ENV === 'production') {
    result = production
  }

  return result
}
