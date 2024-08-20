import createError from 'http-errors'
import { refreshTokenCookieName } from '../../src/data/JwtCookieNames'
import RefreshToken from '../../src/Models/RefreshTokenModel'
import RefreshTokenService from '../../src/Services/RefreshTokenServices'
import { signJwt } from '../../src/utils/JwtUtils'
import { setupSequelize } from '../config/setup/sequelizeSetup'
import { Sequelize } from 'sequelize'

jest.mock('../../src/utils/JwtUtils', () => {
  const actualModule = jest.requireActual('../../src/utils/JwtUtils')
  return {
    ...actualModule,
    signJwt: jest.fn(() => {
      return 'token'
    }),
    validateJwt: jest.fn(() => {
      return 'valid'
    }),
  }
})

describe('RefreshTokenService', () => {
  let sequelize: Sequelize

  beforeEach(async () => {
    sequelize = await setupSequelize()
    await RefreshToken.create({
      expire_date: new Date('2025-01-01'),
      token: signJwt(1, 'Access'),
      user_id: 1,
    })
  })

  afterEach(() => {
    sequelize.close()
    jest.restoreAllMocks()
  })
  describe('validateRefreshToken', () => {
    it('Deve retornar null se o token for inválido', async () => {
      const token = 'token-inválido'
      const result = await RefreshTokenService.validateRefreshToken(token)
      expect(result).toBeNull()
    })

    it('Deve retornar null se o token não existir no banco de dados', async () => {
      const token = 'token-não-existe'
      jest.spyOn(RefreshToken, 'findOne').mockResolvedValueOnce(null)
      const result = await RefreshTokenService.validateRefreshToken(token)
      expect(result).toBeNull()
    })

    it('Deve retornar null se o token estiver expirado', async () => {
      const token = 'token-expirado'
      const DatabaseToken = { expire_date: new Date('2022-01-01') }
      jest
        .spyOn(RefreshToken, 'findOne')
        .mockResolvedValueOnce(DatabaseToken as any)
      const result = await RefreshTokenService.validateRefreshToken(token)
      expect(result).toBeNull()
    })

    it('Deve retornar o token válido', async () => {
      const token = signJwt(1, 'Access')
      const DatabaseToken = { expire_date: new Date('2025-01-01'), user_id: 1 }
      jest
        .spyOn(RefreshToken, 'findOne')
        .mockResolvedValueOnce(DatabaseToken as any)
      const result = await RefreshTokenService.validateRefreshToken(token)
      expect(result).toEqual(DatabaseToken)
    })
  })

  describe('update', () => {
    it('Deve atualizar o token no banco de dados', async () => {
      const token = 'novo-token'
      const userid = 1
      jest.spyOn(RefreshToken, 'update').mockResolvedValueOnce([1])
      await RefreshTokenService.update(token, userid)
      expect(RefreshToken.update).toHaveBeenCalledTimes(1)
      expect(RefreshToken.update).toHaveBeenCalledWith(
        { token, expire_date: expect.any(Date) },
        { where: { id: userid } }
      )
    })
  })

  describe('create', () => {
    it('Deve criar um novo token no banco de dados', async () => {
      const token = 'novo-token'
      const userid = 1
      jest.spyOn(RefreshToken, 'create').mockResolvedValueOnce({ id: 1 })
      await RefreshTokenService.create(token, userid)
      expect(RefreshToken.create).toHaveBeenCalledTimes(1)
      expect(RefreshToken.create).toHaveBeenCalledWith({
        user_id: userid,
        token,
        expire_date: expect.any(Date),
      })
    })
  })

  describe('updateAccessTokenWithRefreshToken', () => {
    it('Deve retornar um erro se não houver refresh token', async () => {
      const req = { cookies: {} }
      const result =
        await RefreshTokenService.updateAccessTokenWithRefreshToken(req as any)
      if (!(result instanceof createError.HttpError)) {
        fail('Não retornou um erro')
      }

      expect(result.statusCode).toBe(401)
    })

    it('Deve retornar um erro se o refresh token for inválido', async () => {
      const req = { cookies: { [refreshTokenCookieName]: 'token-inválido' } }
      jest
        .spyOn(RefreshTokenService, 'validateRefreshToken')
        .mockResolvedValueOnce(null)
      const result =
        await RefreshTokenService.updateAccessTokenWithRefreshToken(req as any)
      if (!(result instanceof createError.HttpError)) {
        fail('Não retornou um erro')
      }

      expect(result.statusCode).toBe(401)
    })

    it('Deve retornar um novo access token e refresh token', async () => {
      const req = { cookies: { [refreshTokenCookieName]: 'token-válido' } }
      const validatedRefreshToken = { user_id: 1 }
      jest
        .spyOn(RefreshTokenService, 'validateRefreshToken')
        .mockResolvedValueOnce(validatedRefreshToken as RefreshToken)

      const result =
        await RefreshTokenService.updateAccessTokenWithRefreshToken(req as any)
      expect(result).toEqual({
        oldRefreshTokenObject: validatedRefreshToken,
        newAccessToken: 'token',
        newRefreshToken: 'token',
      })
    })
  })

  describe('removeByUserId', () => {
    it('Deve remover o token do banco de dados', async () => {
      const userId = 1
      jest.spyOn(RefreshToken, 'destroy').mockResolvedValueOnce(1)
      await RefreshTokenService.removeByUserId(userId)
      expect(RefreshToken.destroy).toHaveBeenCalledTimes(1)
      expect(RefreshToken.destroy).toHaveBeenCalledWith({
        where: { user_id: userId },
      })
    })
  })
})
