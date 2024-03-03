import { Router } from 'express'
import UserController from '../Controllers/UserController'
const router = Router()

const userController = new UserController()

router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)

export { router as UserRouter }
