import request from 'supertest'
import User from '../../src/Models/UserModel'
import { setupSequelize } from '../config/setup/sequelizeSetup'
import EmailConfirmToken from '../../src/Models/EmailConfirmTokenModel'
import { Sequelize } from 'sequelize-typescript'
import EmailConfirmTokenService from '../../src/Services/EmailConfirmTokensServices'
import app from '../../src/app'

describe('Email Confirm Token Controller', () => {
  let sequelize: Sequelize
  let user: User

  beforeAll(async () => {
    sequelize = await setupSequelize()
    user = await User.create({ email: 'teste@email.com', name: 'teste' })
  })

  afterAll(async () => {
    await sequelize.close()
  })

  describe('Send email token', () => {
    it('Deve autenticar o usuário com sucesso', async () => {
      const response = await request(app).get('/confirmEmail/1')

      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'Confirme seu email para continuar. Um token foi enviado para seu email, ou pode ser vizualizado nessa URL em caso de teste:'
          ),
        })
      )

      const tokenUrlRegex = /https:\/\/ethereal\.email\/message\/[A-Za-z0-9-.]+/
      const tokenMatch = response.body.message.match(tokenUrlRegex)
      expect(tokenMatch).toBeDefined()
      const token = tokenMatch[0]
      expect(token).not.toBeNull()
    })

    it('Deve avisar que o usuário não existe, portanto não pode confirmar o token', async () => {
      const response = await request(app).get('/confirmEmail/2').expect(401)
      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining(
            'Confirmação apenas para usuários cadastrados'
          ),
        })
      )
    })

    it('Deve avisar que o usuário já está cadastrado', async () => {
      await user.update({ confirmed: true })
      const response = await request(app).get('/confirmEmail/1').expect(400)
      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining('Seu email já foi autenticado'),
        })
      )
      await user.update({ confirmed: false })
    })
  })

  describe('Confirm token', () => {
    it('Deve verificar e confirmar o token do usuário', async () => {
      await request(app).get('/confirmEmail/1')
      const tokenModel = await EmailConfirmToken.findOne({
        where: { user_id: 1 },
      })

      const response = await request(app)
        .get('/confirmEmail/token/' + tokenModel?.token)
        .expect(200)

      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.stringContaining('Usuário autenticado com sucesso!'),
        })
      )
    })

    it('Deve gerar um erro ao tentar acessar um token inexistente', async () => {
      const response = await request(app)
        .get('/confirmEmail/token/123')
        .expect(400)

      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining('Token Inválido'),
        })
      )
    })

    it('Deve gerar um erro ao acessar um token que não possui referencia a um usuário', async () => {
      const token = await EmailConfirmTokenService.createToken(3)

      const response = await request(app)
        .get('/confirmEmail/token/' + token.tokenObject.token)
        .expect(400)

      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining('Token Inválido'),
        })
      )
    })
  })
})
