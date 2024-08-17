import { Sequelize } from 'sequelize-typescript'
import EmailConfirmToken from '../../src/Models/EmailConfirmTokenModel'
import { setupSequelize } from '../setup/sequelizeSetup'

describe('EmailConfirmToken Model', () => {
  let sequelize: Sequelize
  const user_id = 123
  let emailConfirmToken: EmailConfirmToken

  beforeEach(async () => {
    sequelize = await setupSequelize()
    emailConfirmToken = await EmailConfirmToken.create({
      user_id: user_id,
      token: 'some-token',
      expire_date: new Date(),
    })
  })

  it('Deve criar um Email Confirm Token corretamente', async () => {
    expect(emailConfirmToken).toBeInstanceOf(EmailConfirmToken)
    expect(emailConfirmToken.user_id).toBe(user_id)
    expect(emailConfirmToken.token).toBe('some-token')
    expect(emailConfirmToken.expire_date).toBeInstanceOf(Date)
  })

  it('Deve gerar um erro caso o id não seja adicionado', async () => {
    try {
      // @ts-ignore
      await EmailConfirmToken.create({
        token: 'some-token',
        expire_date: new Date(),
      })
      fail('Expected an error to be thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('Deve gerar um erro caso o token não seja adicionado', async () => {
    try {
      // @ts-ignore
      await EmailConfirmToken.create({
        user_id: 1,
        expire_date: new Date(),
      })
      fail('Expected an error to be thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('Deve gerar um erro caso o expire_date não seja adicionado', async () => {
    try {
      // @ts-ignore
      await EmailConfirmToken.create({
        user_id: 1,
        token: 'some-token',
      })
      fail('Expected an error to be thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('Deve ser null por padrão', async () => {
    expect(emailConfirmToken.emailVizualizer).toBeNull()
  })

  it('Deve gerar um erro caso o user_id seja nulo', async () => {
    try {
      // @ts-ignore
      await EmailConfirmToken.create({
        token: 'some-token',
        expire_date: new Date(),
      })
      fail('Expected an error to be thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('Deve gerar um erro caso o token seja vazio', async () => {
    try {
      await EmailConfirmToken.create({
        user_id: 1,
        token: '',
        expire_date: new Date(),
      })
      fail('Expected an error to be thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('Deve gerar um erro caso o expire_date seja anterior à data atual', async () => {
    try {
      await EmailConfirmToken.create({
        user_id: 1,
        token: 'some-token',
        expire_date: new Date('2020-01-01'),
      })
      fail('Expected an error to be thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('Deve ser possível atualizar um EmailConfirmToken', async () => {
    await emailConfirmToken.update({
      token: 'new-token',
    })
    expect(emailConfirmToken.token).toBe('new-token')
  })

  it('Deve ser possível deletar um EmailConfirmToken', async () => {
    await emailConfirmToken.destroy()
    expect(await EmailConfirmToken.findByPk(emailConfirmToken.id)).toBeNull()
  })
})
