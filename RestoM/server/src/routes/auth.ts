import { Router } from 'express'
import { sendOtp, verifyOtp, signup, login } from '../controllers/authController'

const router = Router()

router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtp)
router.post('/signup', signup)
router.post('/login', login)

export default router
