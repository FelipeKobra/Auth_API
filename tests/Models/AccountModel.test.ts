import { Sequelize } from 'sequelize-typescript'
import Account from '../../src/Models/AccountModel'
import { setupSequelize } from '../config/setup/sequelizeSetup'

describe('Account Model', () => {
  let sequelize: Sequelize
  let account: Account

  beforeEach(async () => {
    sequelize = await setupSequelize()
    account = await Account.create({
      user_id: 1,
      provider: 'google',
      providerAccountId: '1234567890',
    })
  })

  afterEach(async () => {
    await sequelize.close()
  })

  it('Deve criar nova conta', async () => {
    expect(account).toHaveProperty('id')
    expect(account.user_id).toBe(1)
    expect(account.provider).toBe('google')
    expect(account.providerAccountId).toBe('1234567890')
  })

  it('Deve atualizar uma conta existente', async () => {
    await account.update({
      refreshToken: 'new-refresh-token',
    })
    expect(account.refreshToken).toBe('new-refresh-token')
  })

  it('Deve deletar uma conta existente', async () => {
    await account.destroy()
    expect(await Account.count()).toBe(0)
  })

  it('Deve criar conta com dados inválidos', async () => {
    // @ts-ignore

    await expect(Account.create({})).rejects.toThrow()
    // @ts-ignore
    await expect(Account.create({ user_id: null })).rejects.toThrow()
    // @ts-ignore
    await expect(Account.create({ providerAccountId: '' })).rejects.toThrow()
  })

  it('Deve atualizar conta com dados inválidos', async () => {
    // Tentar atualizar com provider inválido
    await expect(account.update({ provider: '' })).rejects.toThrow()

    // @ts-ignore
    // Tentar atualizar com providerAccountId inválido
    await expect(account.update({ providerAccountId: null })).rejects.toThrow()

    // @ts-ignore
    // Tentar atualizar com user_id inválido
    await expect(account.update({ user_id: null })).rejects.toThrow()
  })

  it('Deve excluir conta inexistente', async () => {
    await expect(Account.destroy({ where: { id: 999 } })).resolves.toBe(0)
  })

  it('Deve buscar conta existente', async () => {
    const foundAccount = await Account.findByPk(account.id)
    expect(foundAccount).not.toBeNull()
    // @ts-ignore
    expect(foundAccount.user_id).toBe(1)
    // @ts-ignore
    expect(foundAccount.provider).toBe('google')
    // @ts-ignore
    expect(foundAccount.providerAccountId).toBe('1234567890')
  })

  it('Deve buscar conta inexistente', async () => {
    const foundAccount = await Account.findByPk(999)
    expect(foundAccount).toBeNull()
  })
})
