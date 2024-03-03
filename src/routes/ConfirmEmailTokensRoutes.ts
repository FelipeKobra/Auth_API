import { Router } from 'express'
import EmailConfirmTokenController from '../Controllers/EmailConfirmTokenController'
const router = Router()
const emailConfirmTokenController = new EmailConfirmTokenController()


router.get('/:userid', emailConfirmTokenController.sendEmailToken)
router.get('/token/:token', emailConfirmTokenController.confirmToken)

export { router as EmailConfirmRouter }
