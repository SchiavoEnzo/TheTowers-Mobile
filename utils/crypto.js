import { randomBytes, createHash, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const derive = promisify(scrypt)

export const token = () => randomBytes(32).toString('hex')
export const digest = (value) => createHash('sha256').update(value).digest('hex')

export async function hashPassword(password, salt) {
  return (await derive(password, salt, 64)).toString('hex')
}

export async function verifyPassword(password, account) {
  const actual = await derive(password, account?.salt ?? 'missing-account', 64)
  return Boolean(account) && timingSafeEqual(Buffer.from(account.hash, 'hex'), actual)
}
