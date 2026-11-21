import { authController } from '../controllers/auth.controller.js'

export default [
  { method: 'POST', path: ['register'], public: true, handler: authController.register },
  { method: 'POST', path: ['login'], public: true, handler: authController.login },
  { method: 'POST', path: ['logout'], handler: authController.logout },
]
