import { credentials } from '../models/account.model.js'
import { token, digest, hashPassword, verifyPassword } from '../utils/crypto.js'
import { fail } from '../utils/errors.js'

export async function actor(db, req) {
  const raw = req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1]
  if (!raw) fail(401, 'Token obrigatório')
  const session = await db.collection('sessions').findOne({
    _id: digest(raw),
    expires: { $gt: new Date() },
  })
  if (!session) fail(401, 'Sessão inválida')
  return session
}

export async function register(db, input) {
  const { email, password } = credentials.parse(input)
  const salt = token()
  const hash = await hashPassword(password, salt)
  const profile = { name: null, image: null }
  const result = await db.collection('accounts').insertOne({ email, salt, hash, profile })
  return { id: result.insertedId, email, profile }
}

export async function login(db, input) {
  const { email, password } = credentials.parse(input)
  const account = await db.collection('accounts').findOne({ email })
  if (!(await verifyPassword(password, account))) fail(401, 'Credenciais inválidas')
  const raw = token()
  const expires = new Date(Date.now() + 86400000)
  await db.collection('sessions').insertOne({
    _id: digest(raw),
    user: account._id.toString(),
    expires,
  })
  return { token: raw, expires }
}

export async function logout(db, session) {
  await db.collection('sessions').deleteOne({ _id: session._id })
}
