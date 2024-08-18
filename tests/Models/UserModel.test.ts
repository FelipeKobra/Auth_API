import { setupSequelize } from '../setup/sequelizeSetup'
import User from '../../src/Models/UserModel'
import { Sequelize } from 'sequelize-typescript'

describe('User model', () => {
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

  it('Criar novo usuário', async () => {
    expect(user.name).toBe('John Doe')
    expect(user.email).toBe('johndoe@example.com')
    expect(user.password).not.toBe(null)
  })

  it('Não deverá criar um usuário com mesmo email', async () => {
    try {
      await User.create({
        name: 'Jane Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      })
      fail('Não deve ter criado o usuário')
    } catch (error: any) {
      expect(error.name).toBe('SequelizeUniqueConstraintError')
    }
  })

  it('Deve atualizar o usuário', async () => {
    await user.update({
      name: 'Jane Doe',
      email: 'janedoe@example.com',
    })

    expect(user.name).toBe('Jane Doe')
    expect(user.email).toBe('janedoe@example.com')
  })

  it('Deve deletar o usuário', async () => {
    await user.destroy()

    const deletedUser = await User.findByPk(user.id)
    expect(deletedUser).toBe(null)
  })

  it('Deve retornar erro ao criar usuário sem nome', async () => {
    try {
      // @ts-expect-error
      await User.create({
        email: 'johndoe@example.com',
        password: 'password123',
      })
      fail('Deveria ter retornado erro')
    } catch (error: any) {
      expect(error.name).toBe('SequelizeUniqueConstraintError')
    }
  })

  it('Deve retornar erro ao criar usuário sem email', async () => {
    try {
      // @ts-expect-error
      await User.create({
        name: 'John Doe',
        password: 'password123',
      })
      fail('Deveria ter retornado erro')
    } catch (error: any) {
      expect(error.name).toBe('ReferenceError')
    }
  })

  it('Deve retornar erro ao criar usuário sem senha', async () => {
    try {
      await User.create({
        name: 'Joh Doe',
        email: 'johnde@example.com',
      })
      fail('Deveria ter retornado erro')
    } catch (error: any) {
      expect(error.name).toBe('ReferenceError')
    }
  })

  it('Deve buscar usuário por ID', async () => {
    const foundUser = await User.findByPk(user.id)
    expect(foundUser).not.toBeNull()
    // @ts-ignore
    expect(foundUser.name).toBe('John Doe')
    // @ts-ignore
    expect(foundUser.email).toBe('johndoe@example.com')
  })

  it('Deve buscar usuário por email', async () => {
    const foundUser = await User.findOne({
      where: { email: 'johndoe@example.com' },
    })
    expect(foundUser).not.toBeNull()
    // @ts-ignore
    expect(foundUser.name).toBe('John Doe')
    // @ts-ignore
    expect(foundUser.email).toBe('johndoe@example.com')
  })
})
