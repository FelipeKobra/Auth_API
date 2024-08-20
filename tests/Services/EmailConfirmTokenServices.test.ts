import { v4 } from 'uuid'
import EmailConfirmToken from '../../src/Models/EmailConfirmTokenModel'
import EmailConfirmTokenService from '../../src/Services/EmailConfirmTokensServices'
import { Sequelize } from 'sequelize-typescript'
import User from '../../src/Models/UserModel'
import { setupSequelize } from '../config/setup/sequelizeSetup'

describe('Serviço de Token de Confirmação de Email', () => {
  let sequelize: Sequelize

  beforeEach(async () => {
    sequelize = await setupSequelize()
    await User.create({ email: 'teste@email.com', name: 'teste' })
  })

  afterEach(async () => {
    await sequelize.close()
  })

  describe('sendToken', () => {
    const receiverEmail = 'teste@example.com'
    const receiverName = 'Teste'
    it('Deve enviar um token de confirmação de email com sucesso', async () => {
      const result = await EmailConfirmTokenService.sendToken(
        receiverEmail,
        receiverName,
        v4()
      )
      expect(typeof result).toBe('string')
    })

    it('Deve lançar um erro se o envio do token falhar', async () => {
      const token = 'token-de-teste'

      try {
        await EmailConfirmTokenService.sendToken(
          receiverEmail,
          receiverName,
          token
        )
        fail('Erro esperado')
      } catch (error: any) {
        expect(error.status).toBe(401)
        expect(error.message).toBe('Token de confirmação inválido')
      }
    })
  })

  describe('createToken', () => {
    it('Deve criar um token de confirmação de email com sucesso', async () => {
      const userid = 1

      const result = await EmailConfirmTokenService.createToken(userid)
      expect(result).toHaveProperty('tokenObject')
      expect(result).toHaveProperty('expired', false)
    })

    it('Deve lançar um erro se a criação do token falhar', async () => {
      try {
        // @ts-expect-error Teste
        await EmailConfirmTokenService.createToken(null)

        fail('Erro esperado')
      } catch (error: any) {
        expect(error.status).toBe(401)
        expect(error.message).toBe('Usuário inválido')
      }
    })
  })

  describe('updateToken', () => {
    it('Deve atualizar um token de confirmação de email com sucesso', async () => {
      const userid = 1

      const result = await EmailConfirmTokenService.updateToken(userid)
      expect(result).toHaveProperty('tokenObject')
      expect(result).toHaveProperty('expired', false)
    })

    it('Deve lançar um erro se a atualização do token falhar', async () => {
      try {
        // @ts-expect-error Teste
        await EmailConfirmTokenService.updateToken(null)
        fail('Erro esperado')
      } catch (error: any) {
        expect(error.status).toBe(401)
        expect(error.message).toBe('Usuário inválido')
      }
    })
  })

  describe('searchTokenByUserId', () => {
    it('Deve encontrar um token de confirmação de email por usuário com sucesso', async () => {
      const userid = 1
      await EmailConfirmTokenService.createToken(1)

      const result = await EmailConfirmTokenService.searchTokenByUserId(userid)
      expect(result).toHaveProperty('tokenObject')
      expect(result).toHaveProperty('expired', false)
    })

    it('Deve retornar null se não encontrar um token de confirmação de email por usuário', async () => {
      const userid = 2

      const result = await EmailConfirmTokenService.searchTokenByUserId(userid)
      expect(result).toBeNull()
    })

    it('Deve lançar um erro se a busca do token por usuário falhar', async () => {
      try {
        //@ts-expect-error Teste
        await EmailConfirmTokenService.searchTokenByUserId(null)
        fail('Erro esperado')
      } catch (error: any) {
        expect(error.status).toBe(401)
        expect(error.message).toBe('Usuário inválido')
      }
    })
  })

  describe('searchTokenByToken', () => {
    it('Deve encontrar um token de confirmação de email por token com sucesso', async () => {
      const tokenService = await EmailConfirmTokenService.createToken(1)

      const result = await EmailConfirmTokenService.searchTokenByToken(
        tokenService.tokenObject.token
      )
      expect(result).toBeInstanceOf(EmailConfirmToken)
    })

    it('Deve retornar null se não encontrar um token de confirmação de email por token', async () => {
      const token = 'token-inexistente'

      const result = await EmailConfirmTokenService.searchTokenByToken(token)
      expect(result).toBeNull()
    })

    it('Deve lançar um erro se a busca do token por token falhar', async () => {
      try {
        await EmailConfirmTokenService.searchTokenByToken('')
        fail('Erro esperado')
      } catch (error: any) {
        expect(error.status).toBe(401)
        expect(error.message).toBe('Token inválido')
      }
    })
  })
})
