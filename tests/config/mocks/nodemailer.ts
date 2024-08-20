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
  createTransport(): MockTransporter {
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
