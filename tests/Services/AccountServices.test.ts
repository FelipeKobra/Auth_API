import createError from 'http-errors'
import { CreateAccountParams } from '../../src/types/AccountTypes'
import Account from '../../src/Models/AccountModel'
import AccountServices from '../../src/Services/AccountServices'

describe('AccountServices', () => {
  const unixDate = Math.floor(new Date().getTime() / 1000)
  describe('createAccount', () => {
    it('Deve criar uma nova conta', async () => {
      const createAccountParams: CreateAccountParams = {
        provider: 'google',
        providerAccountId: '1234567890',
        user_id: 1,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: unixDate,
      }

      jest.spyOn(Account, 'create').mockResolvedValueOnce({ id: 1 })

      await AccountServices.createAccount(createAccountParams)

      expect(Account.create).toHaveBeenCalledTimes(1)
      expect(Account.create).toHaveBeenCalledWith({
        provider: 'google',
        providerAccountId: '1234567890',
        user_id: 1,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: unixDate,
        tokenType: 'Bearer',
        type: 'oauth',
      })
    })

    it('Deve lançar um erro caso haja falha na criação da conta', async () => {
      const createAccountParams: CreateAccountParams = {
        provider: 'google',
        providerAccountId: '1234567890',
        user_id: 1,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: unixDate,
      }

      jest
        .spyOn(Account, 'create')
        .mockRejectedValueOnce(new Error('Mocked error'))

      await expect(
        AccountServices.createAccount(createAccountParams)
      ).rejects.toThrow(createError(500, 'Mocked error'))
    })

    it('Deve definir o tipo do token como Bearer, caso não definido', async () => {
      const createAccountParams: CreateAccountParams = {
        provider: 'google',
        providerAccountId: '1234567890',
        user_id: 1,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: unixDate,
      }

      jest.spyOn(Account, 'create').mockResolvedValueOnce({ id: 1 })

      await AccountServices.createAccount(createAccountParams)

      expect(Account.create).toHaveBeenCalled()
      expect(Account.create).toHaveBeenCalledWith({
        provider: 'google',
        providerAccountId: '1234567890',
        user_id: 1,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: unixDate,
        tokenType: 'Bearer',
        type: 'oauth',
      })
    })

    it('Deve definir o tipo da conta como oauth, caso não definido', async () => {
      const createAccountParams: CreateAccountParams = {
        provider: 'google',
        providerAccountId: '1234567890',
        user_id: 1,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: unixDate,
      }

      jest.spyOn(Account, 'create').mockResolvedValueOnce({ id: 1 })

      await AccountServices.createAccount(createAccountParams)

      expect(Account.create).toHaveBeenCalled()
      expect(Account.create).toHaveBeenCalledWith({
        provider: 'google',
        providerAccountId: '1234567890',
        user_id: 1,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: unixDate,
        tokenType: 'Bearer',
        type: 'oauth',
      })
    })
  })
})
