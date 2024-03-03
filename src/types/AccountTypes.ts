export type CreateAccountParams = {
  provider: string
  providerAccountId: string
  user_id: number
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
  tokenType?: string
  type?: string
}
