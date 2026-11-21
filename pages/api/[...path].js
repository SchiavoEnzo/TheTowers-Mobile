import { database } from '../../database/connection.js'
import { dispatch } from '../../routes/index.js'
import { handleApiError } from '../../utils/errors.js'

export const config = { api: { bodyParser: { sizeLimit: '128kb' } } }

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const db = await database()
    return await dispatch(db, req.query.path, req, res)
  } catch (error) {
    return handleApiError(error, res)
  }
}
