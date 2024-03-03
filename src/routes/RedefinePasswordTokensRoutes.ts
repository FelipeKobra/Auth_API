import { Router } from 'express'
import RedefinePasswordTokensController from '../Controllers/RedefinePasswordTokensController'
const router = Router()

const redefinePasswordTokensController = new RedefinePasswordTokensController()

router.post('/email', redefinePasswordTokensController.redirectToSendToken)
router.get('/:userid', redefinePasswordTokensController.sendToken)
router.post('/token/:token', redefinePasswordTokensController.changePassword)

export { router as RedefinePasswordRouter }
