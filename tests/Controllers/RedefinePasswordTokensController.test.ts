import { Sequelize } from 'sequelize-typescript'
import request from 'supertest'
import User from '../../src/Models/UserModel'
import app from '../../src/app'
import { baseUrl } from '../../src/data/URL'
import { setupSequelize } from '../setup/sequelizeSetup'

describe('Redefine Password Tokens Controller', () => {
  let user: User
  let sequelize: Sequelize

  beforeAll(async () => {
    sequelize = await setupSequelize()
    user = await User.create({ email: 'teste@email.com', name: 'teste' })
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
    }, 30000)
  })

  describe('Redirect to Send Token', () => {
    it('Deve redirecionar para a rota de envio de token com sucesso', async () => {
      const response = await request(app)
        .post('/redefinePassword/email')
        .send({ email: 'teste@email.com' })
        .expect(302)

      expect(response.header.location).toBe(baseUrl + '/redefinePassword/1')
    })
  })

  describe('Change Password', () => {
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
  })
})
