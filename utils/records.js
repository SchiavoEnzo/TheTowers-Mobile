import { ObjectId } from 'mongodb'

export const newId = () => new ObjectId().toString()
export const member = (user) => ({ $or: [{ owner: user }, { members: user }] })

export function visible(document) {
  const { inviteHash, ...safe } = document
  return safe
}
