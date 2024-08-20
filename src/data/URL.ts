import { config } from 'dotenv'
config()

export const baseUrl = ['development', 'test'].includes(
  process.env.NODE_ENV as string
)
  ? 'http://localhost:3000'
  : 'https://novodominio.com'
