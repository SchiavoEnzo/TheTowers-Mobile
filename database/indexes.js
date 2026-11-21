export async function createIndexes(db) {
  await Promise.all([
    db.collection('accounts').createIndex({ email: 1 }, { unique: true }),
    db.collection('sessions').createIndex({ expires: 1 }, { expireAfterSeconds: 0 }),
    db.collection('records').createIndex({ kind: 1, owner: 1 }),
  ])
}
