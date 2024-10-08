import { Sequelize } from 'sequelize-typescript'
import bcrypt from 'bcrypt'
import request from 'supertest'
import User from '../../src/Models/UserModel'
import app from '../../src/app'
import { setupSequelize } from '../config/setup/sequelizeSetup'
import RefreshTokenService from '../../src/Services/RefreshTokenServices'
import { signJwt } from '../../src/utils/JwtUtils'

jest.useRealTimers()

describe('User Controller', () => {
  let user: User
  let sequelize: Sequelize

  beforeEach(async () => {
    sequelize = await setupSequelize()
    user = await User.create({
      email: 'teste@email.com',
      name: 'teste',
      password: 'teste',
    })
  })

  afterEach(async () => {
    await sequelize.close()
  })

  describe('Register User', () => {
    it('Deve registrar um usuário com sucesso', async () => {
      const response = await request(app)
        .post('/user/register')
        .send({
          name: 'teste',
          email: 'teste2@email.com',
          password: 'testeteste',
        })
        .expect(200)

      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.stringContaining('Usuário Criado com Sucesso'),
        })
      )
    })

    it('Deve retornar erro 400 ao registrar usuário sem nome', async () => {
      const response = await request(app)
        .post('/user/register')
        .send({ email: 'teste2@email.com', password: 'teste' })
        .expect(400)

      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining(
            'Não há o nome do usuário, lembre de adicionar o campo `name`'
          ),
        })
      )
    })

    it('Deve retornar erro 400 ao registrar usuário sem email', async () => {
      const response = await request(app)
        .post('/user/register')
        .send({ name: 'teste', password: 'teste' })
        .expect(400)

      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining(
            'Não há o nome de email, lembre de adicionar o campo `email`'
          ),
        })
      )
    })

    it('Deve retornar erro 400 ao registrar usuário sem senha', async () => {
      const response = await request(app)
        .post('/user/register')
        .send({ name: 'teste', email: 'teste2@email.com' })
        .expect(400)

      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining(
            'Não há senha para registrar-se, lembre de adicionar o campo `password`'
          ),
        })
      )
    })
  })

  describe('Login User', () => {
    beforeEach(async () => {
      const hashedPass = await bcrypt.hash('teste', 10)
      user.update({ password: hashedPass })
    })
    it('Deve logar um usuário com sucesso', async () => {
      const response = await request(app)
        .post('/user/login')
        .send({ email: 'teste@email.com', password: 'teste' })

      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.stringContaining('Login realizado com sucesso'),
          token: expect.stringMatching(/.{680,}/),
        })
      )
    })

    it('Deve retornar erro 400 ao logar usuário sem email', async () => {
      const response = await request(app)
        .post('/user/login')
        .send({ password: 'teste' })
        .expect(400)

      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining(
            'Não há o nome de email, lembre de adicionar o campo `email`'
          ),
        })
      )
    })

    it('Deve retornar erro 400 ao logar usuário sem senha', async () => {
      const response = await request(app)
        .post('/user/login')
        .send({ email: 'teste@email.com' })
        .expect(400)

      expect(response.body).toEqual(
        expect.objectContaining({
          error: expect.stringContaining(
            'Não há senha para registrar-se, lembre de adicionar o campo `password`'
          ),
        })
      )
    })
  })

  describe('Logout User', () => {
    it('Deve deslogar um usuário com sucesso', async () => {
      const newAccessToken = signJwt(user.id, 'Access')
      RefreshTokenService.create(newAccessToken, 1)
      const response = await request(app)
        .get('/user/logout')
        .set('Authorization', `Bearer ${newAccessToken}`)

      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.stringContaining(
            'Você saiu da sua conta com sucesso'
          ),
        })
      )
    })
  })
})
