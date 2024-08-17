import { config } from 'dotenv'
config()

export const baseUrl =
  (process.env.NODE_ENV as string) === 'development'||'test'
    ? 'http://localhost:3000'
    : 'https://novodominio.com'
