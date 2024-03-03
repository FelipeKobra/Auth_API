import { NextFunction,Request,Response } from 'express'

export type DefaultRoute = (req: Request, res: Response) => any

export type MiddlewareType = (
  req: Request,
  res: Response,
  next: NextFunction
) => any
