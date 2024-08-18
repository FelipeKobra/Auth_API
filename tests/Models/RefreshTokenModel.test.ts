import { Sequelize } from 'sequelize'
import { setupSequelize } from '../setup/sequelizeSetup'
import RefreshToken from '../../src/Models/RefreshTokenModel'
import User from '../../src/Models/UserModel'

describe('RefreshToken model', () => {
  let sequelize: Sequelize
  let user: User

  beforeEach(async () => {
    sequelize = await setupSequelize()
    user = await User.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password123',
    })
  })

  afterEach(async () => {
    await sequelize.close()
  })

  it('Deve criar um novo token de refresh', async () => {
    const refreshToken = await RefreshToken.create({
      user_id: user.id,
      token: 'token-de-refresh',
      expire_date: new Date(Date.now() + 3600000), // 1 hora
    })

    expect(refreshToken.user_id).toBe(user.id)
    expect(refreshToken.token).toBe('token-de-refresh')
    expect(refreshToken.expire_date).toBeInstanceOf(Date)
  })

  it('Não deve criar um token de refresh com mesmo usuário', async () => {
    await RefreshToken.create({
      user_id: user.id,
      token: 'token-de-refresh',
      expire_date: new Date(Date.now() + 3600000), // 1 hora
    })

    try {
      await RefreshToken.create({
        user_id: user.id,
        token: 'outro-token-de-refresh',
        expire_date: new Date(Date.now() + 3600000), // 1 hora
      })
      fail('Não deve ter criado o token de refresh')
    } catch (error: any) {
      expect(error.name).toBe('SequelizeUniqueConstraintError')
    }
  })

  it('Deve bloquear um token de refresh', async () => {
    const refreshToken = await RefreshToken.create({
      user_id: user.id,
      token: 'token-de-refresh',
      expire_date: new Date(Date.now() + 3600000), // 1 hora
    })

    await refreshToken.update({ blocked: true })

    expect(refreshToken.blocked).toBe(true)
  })

  it('Deve buscar token de refresh por usuário', async () => {
    const refreshToken = await RefreshToken.create({
      user_id: user.id,
      token: 'token-de-refresh',
      expire_date: new Date(Date.now() + 3600000), // 1 hora
    })

    const foundRefreshToken = await RefreshToken.findOne({
      where: { user_id: user.id },
    })

    expect(foundRefreshToken).not.toBeNull()
    //@ts-ignore
    expect(foundRefreshToken.user_id).toBe(user.id)
    //@ts-ignore
    expect(foundRefreshToken.token).toBe('token-de-refresh')
  })
})
