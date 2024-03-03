import createError from 'http-errors'
import { NextFunction, Request, Response } from 'express'
import UserService from '../Services/UserServices'

const userService = new UserService()

export default class UserController {
  public async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body

      if (!name)
        return next(
          createError(
            400,
            'Não há o nome do usuário, lembre de adicionar o campo `name`'
          )
        )
      else if (!email)
        return next(
          createError(
            400,
            'Não há o nome de email, lembre de adicionar o campo `email`'
          )
        )
      else if (!password)
        return next(
          createError(
            400,
            'Não há senha para registrar-se, lembre de adicionar o campo `password`'
          )
        )

      const response = await userService.Register(name, email, password)

      if (response.success === true) {
        return res.json({ message: response.message })
      } else {
        return next(response)
      }
    } catch (error: any) {
      return next(createError(500, error))
    }
  }

  public async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.Login(req, res, next)
    } catch (error: any) {
      return next(createError(500, error))
    }
  }
}
