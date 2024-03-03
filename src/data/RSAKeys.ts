import fs from 'fs'

export const publicKey = fs.readFileSync('./certs/public.pem', 'utf8')
export const privateKey = fs.readFileSync('./certs/private.pem', 'utf8')
