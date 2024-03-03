import { config } from 'dotenv'
config()

export const baseUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://novodominio.com'
