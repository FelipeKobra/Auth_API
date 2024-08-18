import { Sequelize } from 'sequelize-typescript'
import request from 'supertest'
import bcrypt from 'bcrypt'
import User from '../../src/Models/UserModel'
import app from '../../src/app'
import { baseUrl } from '../../src/data/URL'
import { setupSequelize } from '../config/setup/sequelizeSetup'
import RedefinePasswordTokensServices from '../../src/Services/RedefinePasswordTokensServices'
import RedefinePasswordTokens from '../../src/Models/RedefinePasswordTokensModel'

describe('Redefine Password Tokens Controller', () => {
  let user: User
  let sequelize: Sequelize

  beforeEach(async () => {
    sequelize = await setupSequelize()
    user = await User.create({ email: 'teste@email.com', name: 'teste' })
  })

  afterEach(async () => {
    await sequelize.close()
  })

  describe('Send Token', () => {
    it('Deve enviar um token de redefinição de senha com sucesso', async () => {
      const response = await request(app).get('/redefinePassword/1').expect(200)

      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'Redefinição de senha enviada para o seu email, ou pode ser vizualizada nesse link'
          ),
        })
      )

      const tokenUrlRegex = /https:\/\/ethereal\.email\/message\/[A-Za-z0-9-.]+/
      const tokenMatch = response.body.message.match(tokenUrlRegex)
      expect(tokenMatch).toBeDefined()
      const token = tokenMatch[0]
      expect(token).not.toBeNull()
    })

    it('Deve retornar erro 500 ao ocorrer erro interno ao enviar token', async () => {
      jest
        .spyOn(RedefinePasswordTokensServices, 'sendToken')
        .mockRejectedValueOnce(new Error('Erro interno'))

      const response = await request(app).get('/redefinePassword/1').expect(500)

      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining('Erro interno'),
        })
      )
    })

    it('Deve retornar erro 400 ao enviar token para usuário que não existe', async () => {
      const response = await request(app).get('/redefinePassword/2')

      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining('Número de usuário inválido'),
        })
      )
    })
  })

  describe('Redirect to Send Token', () => {
    it('Deve redirecionar para a rota de envio de token com sucesso', async () => {
      const response = await request(app)
        .post('/redefinePassword/email')
        .send({ email: 'teste@email.com' })
        .expect(302)

      expect(response.header.location).toBe(baseUrl + '/redefinePassword/1')
    })

    it('Deve retornar erro 401 ao redirecionar para envio de token com email incorreto', async () => {
      const response = await request(app)
        .post('/redefinePassword/email')
        .send({ email: 'invalid@email.com' })
        .expect(401)

      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining('Email incorreto'),
        })
      )
    })

    it('Deve retornar erro 500 ao ocorrer erro interno ao redirecionar para envio de token', async () => {
      jest
        .spyOn(User, 'findOne')
        .mockRejectedValueOnce(new Error('Erro interno'))

      const response = await request(app)
        .post('/redefinePassword/email')
        .send({ email: 'teste@email.com' })
        .expect(500)

      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining('Erro interno'),
        })
      )
    })
  })

  describe('Change Password', () => {
    let token: string
    beforeEach(async () => {
      const tokenService = await RedefinePasswordTokensServices.createToken(
        user.id
      )
      token = tokenService.token
    })

    it('Deve avisar que o token é inválido', async () => {
      const response = await request(app)
        .post('/redefinePassword/token/invalid')
        .send({ password: 'newpassword' })
        .expect(400)

      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining('Token de Recuperação Inválido'),
        })
      )
    })

    it('Deve retornar erro 400 ao alterar senha com token inválido', async () => {
      const response = await request(app)
        .post('/redefinePassword/token/invalid')
        .send({ password: 'newpassword' })
        .expect(400)
      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining('Token de Recuperação Inválido'),
        })
      )
    })

    it('Deve retornar erro 401 ao alterar senha com token expirado', async () => {
      await RedefinePasswordTokens.update(
        { expire_date: new Date('2022-01-01') },
        { where: { token } }
      )

      const response = await request(app)
        .post('/redefinePassword/token/' + token)
        .send({ password: 'newpassword' })
        .expect(401)

      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining('O token não é mais válido'),
        })
      )
    })

    it('Deve retornar erro 400 ao alterar senha com senha inválida', async () => {
      const response = await request(app)
        .post('/redefinePassword/token/' + token)
        .send({ password: 'short' })
        .expect(400)

      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining(
            'A senha deve possuir no mínimo 6 caracteres'
          ),
        })
      )
    })

    it('Deve retornar erro 500 ao ocorrer erro interno ao alterar senha', async () => {
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementationOnce(() => Promise.reject(new Error('Erro interno')))

      const response = await request(app)
        .post('/redefinePassword/token/' + token)
        .send({ password: 'newpassword' })
        .expect(500)

      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining('Erro interno'),
        })
      )
    })
  })
})
