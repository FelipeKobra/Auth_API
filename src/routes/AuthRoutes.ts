import { Router } from 'express'
import passport from 'passport'
import AuthController from '../Controllers/AuthController'

const authController = new AuthController()

const router = Router()

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get('/google/callback', authController.googleCallback)

export { router as AuthRouter }
