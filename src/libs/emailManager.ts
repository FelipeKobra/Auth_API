import createError from 'http-errors'
import nodemailer from 'nodemailer'
import { sendEmailType } from '../types/NodeMailTypes'

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
      return createError(
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
  }: sendEmailType) {
    try {
      const transporter = await this.createTransporter()

      const emailContent = {
        from: 'Sender Name <sender@example.com>',
        to: `${receiverName} <${receiverEmail}>`,
        subject: `Token da Auth API sobre ${titulo}`,
        html: `<p>
        A duração do token é de 10 minutos <br>
        <a href=${tokenURL} rel="noopener noreferrer">Clique aqui para verificar seu email</a>
        </p>`,
      }

      const info = await transporter.sendMail(emailContent)

      return nodemailer.getTestMessageUrl(info)
    } catch (error: any) {
      return createError(500, 'Erro durante o envio do email: ' + error)
    }
  }
}
