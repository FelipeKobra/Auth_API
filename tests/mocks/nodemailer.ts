import { Transport, TransportOptions } from 'nodemailer'
import JSONTransport from 'nodemailer/lib/json-transport'
import SendmailTransport from 'nodemailer/lib/sendmail-transport'
import SESTransport from 'nodemailer/lib/ses-transport'
import SMTPPool from 'nodemailer/lib/smtp-pool'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import StreamTransport from 'nodemailer/lib/stream-transport'

type TransportType =
  | SMTPTransport
  | SMTPTransport.Options
  | string
  | SMTPPool
  | SMTPPool.Options
  | SendmailTransport
  | SendmailTransport.Options
  | StreamTransport
  | StreamTransport.Options
  | JSONTransport
  | JSONTransport.Options
  | SESTransport
  | SESTransport.Options
  | Transport<any>
  | TransportOptions

interface MockTransporter {
  sendMail: (mailOptions: any) => string
}

module.exports = {
  createTestAccount: async () => {
    return {
      smtp: {
        host: 'smtp.example.com',
        port: 587,
        secure: false,
      },
      user: 'user@example.com',
      pass: 'password',
    }
  },
  createTransport<T>(
    transport: TransportType,
    defaults?: TransportOptions
  ): MockTransporter {
    return {
      sendMail: () => {
        return 'https://ethereal.email/message/ZsC89Lz.uA-zUQkkZsC8-cGk0kDvNVy1AAAAAXqvkR2GMxCSj-n6W.wqMjo'
      },
    }
  },
  getTestMessageUrl: (info: string) => {
    return info
  },
}
