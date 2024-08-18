import { Sequelize } from 'sequelize-typescript'
import RedefinePasswordTokens from '../../src/Models/RedefinePasswordTokensModel'
import User from '../../src/Models/UserModel'
import RedefinePasswordTokensServices from '../../src/Services/RedefinePasswordTokensServices'
import { setupSequelize } from '../config/setup/sequelizeSetup'

describe('Serviço de Token de Redefinição de Senha', () => {
  let sequelize: Sequelize
  let user: User
  beforeEach(async () => {
    sequelize = await setupSequelize()
    user = await User.create({ email: 'teste@email.com', name: 'teste' })
  })

  afterEach(async () => {
    await sequelize.close()
  })

  describe('findTokenByUserId', () => {
    it('deve encontrar um token de redefinição de senha por usuário com sucesso', async () => {
      const token = await RedefinePasswordTokensServices.createToken(user.id)
      const result = await RedefinePasswordTokensServices.findTokenByUserId(
        user.id
      )
      expect(result).toBeInstanceOf(RedefinePasswordTokens)
    })

    it('deve retornar null se não encontrar um token de redefinição de senha por usuário', async () => {
      const result = await RedefinePasswordTokensServices.findTokenByUserId(2)
      expect(result).toBeNull()
    })

    it('deve lançar um erro se a busca do token por usuário falhar', async () => {
      try {
        // @ts-expect-error
        await RedefinePasswordTokensServices.findTokenByUserId(null)
        fail('Erro esperado')
      } catch (error: any) {
        expect(error.status).toBe(401)
      }
    })
  })

  describe('findTokenByToken', () => {
    it('deve encontrar um token de redefinição de senha por token com sucesso', async () => {
      const token = await RedefinePasswordTokensServices.createToken(user.id)
      const result = await RedefinePasswordTokensServices.findTokenByToken(
        token.token
      )
      expect(result).toBeInstanceOf(RedefinePasswordTokens)
    })

    it('deve retornar null se não encontrar um token de redefinição de senha por token', async () => {
      const result =
        await RedefinePasswordTokensServices.findTokenByToken(
          'token-inexistente'
        )
      expect(result).toBeNull()
    })

    it('deve lançar um erro se a busca do token por token falhar', async () => {
      try {
        await RedefinePasswordTokensServices.findTokenByToken('')
        fail('Erro esperado')
      } catch (error: any) {
        expect(error.status).toBe(401)
      }
    })
  })

  describe('createToken', () => {
    it('deve criar um token de redefinição de senha com sucesso', async () => {
      const result = await RedefinePasswordTokensServices.createToken(user.id)
      expect(result).toBeInstanceOf(RedefinePasswordTokens)
    })

    it('deve lançar um erro se a criação do token falhar', async () => {
      try {
        // @ts-expect-error
        await RedefinePasswordTokensServices.createToken(null)
        fail('Erro esperado')
      } catch (error: any) {
        expect(error.status).toBe(401)
      }
    })
  })

  describe('sendToken', () => {
    it('deve enviar um token de redefinição de senha com sucesso', async () => {
      const token = await RedefinePasswordTokensServices.createToken(user.id)
      const tokenURL = RedefinePasswordTokensServices.createTokenURL(
        token.token
      )
      const result = await RedefinePasswordTokensServices.sendToken(
        user.email,
        user.name,
        tokenURL
      )
      expect(typeof result).toBe('string')
    })

    it('deve lançar um erro se o envio do token falhar', async () => {
      try {
        await RedefinePasswordTokensServices.sendToken(
          user.email,
          user.name,
          //@ts-expect-error
          null
        )
        fail('Erro esperado')
      } catch (error: any) {
        expect(error.status).toBe(401)
      }
    })
  })

  describe('updateToken', () => {
    it('deve atualizar um token de redefinição de senha com sucesso', async () => {
      await RedefinePasswordTokensServices.createToken(user.id)
      const result = await RedefinePasswordTokensServices.updateToken(user.id)
      expect(result).toBeInstanceOf(RedefinePasswordTokens)
    })

    it('deve lançar um erro se a atualização do token falhar', async () => {
      try {
        // @ts-expect-error
        await RedefinePasswordTokensServices.updateToken(null)
        fail('Erro esperado')
      } catch (error: any) {
        expect(error.status).toBe(401)
      }
    })
  })
})
