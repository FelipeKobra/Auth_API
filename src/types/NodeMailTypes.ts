export type sendEmailType = {
  receiverEmail: string
  titulo: 'Token de Confirmação de Email' | 'Token de Recuperação de Senha'
  tokenURL: URL
  receiverName: string | null
  type:'EmailConfirm' | 'PasswordReset'
}
