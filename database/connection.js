import { MongoClient } from 'mongodb'
import { createIndexes } from './indexes.js'

export async function database() {
  if (!process.env.MONGODB_URI || !process.env.MONGODB_DB)
    throw new Error('Configure MongoDB')
  if (!globalThis.torresConnection) {
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 6000,
    })
    globalThis.torresConnection = (async () => {
      await client.connect()
      const db = client.db(process.env.MONGODB_DB)
      await createIndexes(db)
      return db
    })().catch(async (e) => {
      delete globalThis.torresConnection
      await client.close()
      throw e
    })
  }
  return globalThis.torresConnection
}
