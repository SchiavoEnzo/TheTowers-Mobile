import * as auth from '../services/auth.service.js'

export const authController = {
  async register({ db, req, res }) {
    return res.status(201).json(await auth.register(db, req.body))
  },
  async login({ db, req, res }) {
    return res.json(await auth.login(db, req.body))
  },
  async logout({ db, session, res }) {
    await auth.logout(db, session)
    return res.status(204).end()
  },
}
