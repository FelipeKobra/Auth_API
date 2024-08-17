import { Sequelize } from 'sequelize-typescript'
import RedefinePasswordTokens from '../../src/Models/RedefinePasswordTokensModel'
import { setupSequelize } from '../setup/sequelizeSetup'

describe('RedefinePasswordTokens Model', () => {
  let sequelize: Sequelize
  let redefinePasswordToken: RedefinePasswordTokens
  const user_id = 123
  const token = 'some-token'
  const expire_date = new Date()

  beforeEach(async () => {
    sequelize = await setupSequelize()

    redefinePasswordToken = await RedefinePasswordTokens.create({
      user_id: user_id,
      token,
      expire_date,
    })
  })

  it('Deve criar um RedefinePasswordToken corretamente', async () => {
    expect(redefinePasswordToken).toBeInstanceOf(RedefinePasswordTokens)
    expect(redefinePasswordToken.user_id).toBe(user_id)
    expect(redefinePasswordToken.token).toBe(token)
    expect(redefinePasswordToken.expire_date).toBeInstanceOf(Date)
  })

  it('Deve gerar um erro caso o user_id seja nulo', async () => {
    try {
      // @ts-ignore
      await RedefinePasswordTokens.create({
        token,
        expire_date,
      })
      fail('Expected an error to be thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('Deve gerar um erro caso o token seja vazio', async () => {
    try {
      await RedefinePasswordTokens.create({
        user_id: user_id,
        token: '',
        expire_date,
      })
      fail('Expected an error to be thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('Deve gerar um erro caso o expire_date seja anterior à data atual', async () => {
    try {
      await RedefinePasswordTokens.create({
        user_id: user_id,
        token,
        expire_date: new Date('2020-01-01'),
      })
      fail('Expected an error to be thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('Deve ser possível atualizar um RedefinePasswordToken', async () => {
    await redefinePasswordToken.update({
      token: 'new-token',
    })
    expect(redefinePasswordToken.token).toBe('new-token')
  })

  it('Deve ser possível deletar um RedefinePasswordToken', async () => {
    await redefinePasswordToken.destroy()
    expect(
      await RedefinePasswordTokens.findByPk(redefinePasswordToken.id)
    ).toBeNull()
  })
})
