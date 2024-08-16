import { Sequelize } from 'sequelize-typescript'
import Account from '../../src/Models/AccountModel'
import { closeSequelize, setupSequelize } from '../setup/sequelizeSetup'

describe('Account Model', () => {
  let sequelize: Sequelize
  let account: Account

  beforeEach(async () => {
    sequelize = await setupSequelize()
  })

  afterEach(async () => {
    await closeSequelize(sequelize)
  })

  it('Criar nova conta', async () => {
    account = await Account.create({
      user_id: 1,
      provider: 'google',
      providerAccountId: '1234567890',
    })
    expect(account).toHaveProperty('id')
    expect(account.user_id).toBe(1)
    expect(account.provider).toBe('google')
    expect(account.providerAccountId).toBe('1234567890')
  })

  it('Atualizar uma conta existente', async () => {
    account = await Account.create({
      user_id: 1,
      provider: 'google',
      providerAccountId: '1234567890',
    })
    await account.update({
      refreshToken: 'new-refresh-token',
    })
    expect(account.refreshToken).toBe('new-refresh-token')
  })

  it('Deletar uma conta existente', async () => {
    account = await Account.create({
      user_id: 1,
      provider: 'google',
      providerAccountId: '1234567890',
    })
    await account.destroy()
    expect(await Account.count()).toBe(0)
  })

  it('Criar conta com dados inválidos', async () => {
    // @ts-ignore

    await expect(Account.create({})).rejects.toThrow()
    // @ts-ignore
    await expect(Account.create({ user_id: null })).rejects.toThrow()
    // @ts-ignore
    await expect(Account.create({ providerAccountId: '' })).rejects.toThrow()
  })

  it('Atualizar conta com dados inválidos', async () => {
    account = await Account.create({
      user_id: 1,
      provider: 'google',
      providerAccountId: '1234567890',
    })

    // Tentar atualizar com provider inválido
    await expect(account.update({ provider: '' })).rejects.toThrow()

    // @ts-ignore
    // Tentar atualizar com providerAccountId inválido
    await expect(account.update({ providerAccountId: null })).rejects.toThrow()

    // @ts-ignore
    // Tentar atualizar com user_id inválido
    await expect(account.update({ user_id: null })).rejects.toThrow()
  })

  it('Excluir conta inexistente', async () => {
    await expect(Account.destroy({ where: { id: 999 } })).resolves.toBe(0)
  })

  it('Buscar conta existente', async () => {
    account = await Account.create({
      user_id: 1,
      provider: 'google',
      providerAccountId: '1234567890',
    })
    const foundAccount = await Account.findByPk(account.id)
    expect(foundAccount).not.toBeNull()
    // @ts-ignore
    expect(foundAccount.user_id).toBe(1)
    // @ts-ignore
    expect(foundAccount.provider).toBe('google')
    // @ts-ignore
    expect(foundAccount.providerAccountId).toBe('1234567890')
  })

  it('Buscar conta inexistente', async () => {
    const foundAccount = await Account.findByPk(999)
    expect(foundAccount).toBeNull()
  })
})
