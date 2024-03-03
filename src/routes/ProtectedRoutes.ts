import { Router } from 'express'
import { JwtMiddleware } from '../Middlewares/JwtMiddleware'
import { Request, Response } from 'express'
const router = Router()

router.use(JwtMiddleware)
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Você acessou a rota protegida' })
})

export { router as ProtectedRouter }
