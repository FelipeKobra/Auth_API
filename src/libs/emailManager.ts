import createError from 'http-errors'
import { sendEmailType } from '../types/NodeMailTypes'
import type Nodemailer from 'nodemailer'
let nodemailer: typeof Nodemailer

if ((process.env.NODE_ENV as string) === 'test') {
  nodemailer = require('../../tests/mocks/nodemailer')
} else {
  nodemailer = require('nodemailer')
}

export default class emailManager {
  public async createTransporter() {
    try {
      const testAccount = await nodemailer.createTestAccount()

      const transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })

      return transporter
    } catch (error) {
      throw createError(
        500,
        'Erro durante a criação do Email Transporter: ' + error
      )
    }
  }

  public async sendTokenEmail({
    receiverEmail,
    titulo,
    tokenURL,
    receiverName,
    type,
  }: sendEmailType) {
    try {
      let message = `A duração do token é de 10 minutos <br>
      <a href=${tokenURL} rel='noopener noreferrer'>Clique aqui para verificar seu email</a>`

      if (type === 'PasswordReset')
        message = `A duração do token é de 10 minutos <br>
      Envie um POST Request ,com o campo <span style="color: red;">password</span> e sua <span style="color: red;">nova senha</span>, para o endpoint abaixo: <br>
      <p style="color: blue;">${tokenURL}</p>
`

      const transporter = await this.createTransporter()

      const emailContent = {
        from: 'Sender Name <sender@example.com>',
        to: `${receiverName} <${receiverEmail}>`,
        subject: `Token da Auth API sobre ${titulo}`,
        html: `<p>
        ${message}
        </p>`,
      }

      const info = await transporter.sendMail(emailContent)

      return nodemailer.getTestMessageUrl(info)
    } catch (error: any) {
      throw createError(500, 'Erro durante o envio do email: ' + error)
    }
  }
}
