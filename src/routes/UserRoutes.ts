import { Router } from 'express'
import UserController from '../Controllers/UserController'
import { JwtMiddleware } from '../Middlewares/JwtMiddleware'
const router = Router()


const userController = new UserController()

router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)

// Rotas Protegidas
router.get('/logout', JwtMiddleware, userController.logoutUser)

export { router as UserRouter }

