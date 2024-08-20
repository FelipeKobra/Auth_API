import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Sequelize } from 'sequelize'
import User from '../../src/Models/UserModel'
import RefreshTokenService from '../../src/Services/RefreshTokenServices'
import UserService from '../../src/Services/UserServices'
import { removeJwtCookies } from '../../src/utils/CookiesUtils'
import { signJwt } from '../../src/utils/JwtUtils'
import { setupSequelize } from '../config/setup/sequelizeSetup'

jest.mock('../../src/utils/CookiesUtils', () => {
  const actualModule = jest.requireActual('../../src/utils/CookiesUtils')
  return {
    ...actualModule,
    sendJwtCookie: jest.fn(),
    removeJwtCookies: jest.fn(),
    getCookie: jest.fn(
      (token: { cookies: { accessToken: string } }) => token.cookies.accessToken
    ),
  }
})

describe('UserService', () => {
  let sequelize: Sequelize

  beforeEach(async () => {
    sequelize = await setupSequelize()
    await User.create({ email: 'johndoe@gmail.com', name: 'John Doe' })
  })

  afterEach(async () => {
    sequelize.close()
  })

  describe('ValidarSenha', () => {
    it('Deve retornar true se senha for compatível', async () => {
      const userPassword = 'hashedPassword'
      const hashedPassword = await bcrypt.hash(userPassword, 10)
      expect(
        await UserService.ValidatePassword(hashedPassword, userPassword)
      ).toBe(true)
    })

    it('Deve retornar false se senha não for compatível', async () => {
      const userPassword = 'hashedPassword'
      const password = 'plainPassword'

      expect(await UserService.ValidatePassword(userPassword, password)).toBe(
        false
      )
    })
  })

  describe('validarEmail', () => {
    it('Deve retornar true se email for válido', () => {
      const email = 'example@example.com'
      expect(UserService.validateEmail(email)).toBe(true)
    })

    it('Deve retornar false se email for inválido', () => {
      const email = 'invalidEmail'
      expect(UserService.validateEmail(email)).toBe(false)
    })
  })

  describe('Registrar', () => {
    it('Deve lançar um erro se nome for vazio', async () => {
      await expect(
        UserService.Register('', 'email@example.com', 'password')
      ).rejects.toThrow('Digite um nome válido')
    })

    it('Deve lançar um erro se email for vazio', async () => {
      await expect(
        UserService.Register('name', '', 'password')
      ).rejects.toThrow('Digite seu nome')
    })

    it('Deve lançar um erro se senha for vazia', async () => {
      await expect(
        UserService.Register('name', 'email@example.com', '')
      ).rejects.toThrow('Digite sua senha')
    })

    it('Deve lançar um erro se senha for muito curta', async () => {
      await expect(
        UserService.Register('name', 'email@example.com', 'short')
      ).rejects.toThrow('A senha deve possuir no mínimo 6 caracteres')
    })

    it('Deve lançar um erro se email for inválido', async () => {
      await expect(
        UserService.Register('name', 'invalidEmail', 'password')
      ).rejects.toThrow('Digite um email válido')
    })

    it('Deve criar um novo usuário se todos os campos forem válidos', async () => {
      const name = 'name'
      const email = 'email@example.com'
      const password = 'password'
      jest.spyOn(User, 'create').mockResolvedValueOnce({ id: 1 })
      const result = await UserService.Register(name, email, password)
      expect(result).toEqual({
        message: 'Usuário Criado com Sucesso',
        success: true,
      })
    })
  })

  describe('Logout', () => {
    it('Deve remover token de refresh e enviar resposta', async () => {
      const req = { user: { id: 1 } } as any
      const res = { json: jest.fn() } as any
      jest.spyOn(RefreshTokenService, 'removeByUserId').mockResolvedValueOnce(1)
      await UserService.Logout(req, res)
      expect(res.json).toHaveBeenCalledTimes(1)
      expect(removeJwtCookies).toHaveBeenCalledTimes(1)
    })

    it('Deve lançar um erro se usuário não estiver autenticado', async () => {
      const req = {} as any
      const res = {} as any
      await expect(UserService.Logout(req, res)).rejects.toThrow(
        'Você não está cadastrado para sair de sua conta'
      )
    })
  })

  describe('findUserById', () => {
    it('Deve retornar um usuário por ID', async () => {
      const userId = 1
      jest
        .spyOn(User, 'findByPk')
        .mockResolvedValueOnce({ id: userId, name: 'John Doe' } as User)
      const user = await UserService.findUserById(userId)
      expect(user).toEqual({ id: userId, name: 'John Doe' })
    })

    it('Deve retornar null se usuário não for encontrado', async () => {
      const userId = 1
      jest.spyOn(User, 'findByPk').mockResolvedValueOnce(null)
      const user = await UserService.findUserById(userId)
      expect(user).toBeNull()
    })
  })

  describe('retornarUsuárioPorCookieToken', () => {
    it('Deve retornar um usuário por token de acesso', async () => {
      const req = {
        cookies: { accessToken: signJwt(1, 'Access') },
      } as any

      const user = await UserService.returnUserByCookieToken(req)
      expect(user).toEqual(
        expect.objectContaining({
          email: 'johndoe@gmail.com',
          name: 'John Doe',
        })
      )
    })

    it('Deve retornar null se token for inválido', async () => {
      const req = { cookies: { accessToken: 'invalidToken' } } as any
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Token Inválido')
      })
      try {
        await UserService.returnUserByCookieToken(req)

        fail('Deveria ter gerado um erro')
      } catch (error) {
        expect(error).toEqual(
          expect.objectContaining({
            message: 'Token Inválido',
            status: 400,
            statusCode: 400,
          })
        )
      }
    })
  })
})
