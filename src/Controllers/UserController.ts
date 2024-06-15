import { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import UserService from '../Services/UserServices'

const userService = new UserService()

export default class UserController {
  public async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body

      if (!name)
        throw createError(
          400,
          'Não há o nome do usuário, lembre de adicionar o campo `name`'
        )
      else if (!email) {
        throw createError(
          400,
          'Não há o nome de email, lembre de adicionar o campo `email`'
        )
      } else if (!password) {
        throw createError(
          400,
          'Não há senha para registrar-se, lembre de adicionar o campo `password`'
        )
      }

      const response = await userService.Register(name, email, password)

      if (response.success === true) {
        return res.json({ message: response.message })
      } else {
        return next(response)
      }
    } catch (error: any) {
      throw createError(500, error)
    }
  }

  public async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body

      if (!email) {
        throw createError(
          400,
          'Não há o nome de email, lembre de adicionar o campo `email`'
        )
      } else if (!password) {
        throw createError(
          400,
          'Não há senha para registrar-se, lembre de adicionar o campo `password`'
        )
      }

      await userService.Login(req, res, next)
    } catch (error: any) {
      throw createError(500, error)
    }
  }

  public async logoutUser(req: Request, res: Response) {
    try {
      await userService.Logout(req, res)
    } catch (error: any) {
      throw createError(500, error)
    }
  }
}
