import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { ObjectId } from 'mongodb'
import { dispatch } from '../routes/index.js'
import { handleApiError } from '../utils/errors.js'

const template = JSON.parse(await readFile(new URL('../examples/agent.json', import.meta.url)))
function fixture() {
  const store = { accounts: [], sessions: [], records: [] }
  function matches(doc, query) {
    return Object.entries(query).every(([key, value]) => {
      if (key === '$or') return value.some(item => matches(doc, item))
      const actual = key.split('.').reduce((obj, k) => obj?.[k], doc)
      if (value && typeof value === 'object' && !(value instanceof ObjectId)) {
        if ('$gt' in value) return actual > value.$gt
        if ('$lt' in value) return actual < value.$lt
        if ('$regex' in value) return new RegExp(value.$regex, value.$options).test(actual)
      }
      if (Array.isArray(actual)) return actual.includes(value)
      return String(actual) === String(value)
    })
  }
  const db = {
    client: { withSession: fn => fn({ withTransaction: fn => fn() }) },
    collection(name) {
      return {
        async insertOne(doc) { doc._id ??= new ObjectId(); store[name].push(doc); return { insertedId: doc._id } },
        async findOne(query) { return store[name].find(doc => matches(doc, query)) },
        find(query) { let rows = store[name].filter(doc => matches(doc, query)); return { sort() { rows.sort((a,b) => String(b._id).localeCompare(String(a._id))); return this }, limit(n) { rows = rows.slice(0,n); return this }, async toArray() { return rows } } },
        async updateOne(query, update) { const doc = store[name].find(doc => matches(doc, query)); if (doc) Object.assign(doc, update.$set); return { matchedCount: doc ? 1 : 0 } },
        async deleteOne(query) { const index = store[name].findIndex(doc => matches(doc, query)); if (index >= 0) store[name].splice(index, 1) },
      }
    },
  }
  async function request(path, method = 'GET', body, token, query = {}) {
    const res = { statusCode: 200, setHeader() {}, status(n) { this.statusCode = n; return this }, json(data) { this.body = data; return this }, end() { return this } }
    try { await dispatch(db, path.split('/'), { method, body, query, headers: token ? { authorization: `Bearer ${token}` } : {} }, res) }
    catch (error) { handleApiError(error, res) }
    return res
  }
  return { request, store }
}

test('cadastro, login, CRUD completo, busca e logout de personagens', async () => {
  const { request } = fixture()
  const credentials = { email: 'mobile@example.com', password: 'Example!2026' }
  assert.equal((await request('auth/register', 'POST', credentials)).statusCode, 201)
  const token = (await request('auth/login', 'POST', credentials)).body.token
  assert.ok(token)
  const created = await request('agents', 'POST', template, token)
  assert.equal(created.statusCode, 201)
  const id = created.body._id
  assert.equal((await request(`agents/${id}`, 'GET', undefined, token)).body.data.caractheristics.name, 'Vigia')
  const edited = structuredClone(template)
  edited.caractheristics.name = 'Clara Mobile'
  edited.atributes['current-pv'] = 0
  assert.equal((await request(`agents/${id}`, 'PUT', edited, token)).statusCode, 200)
  const found = await request('agents', 'GET', undefined, token, { q: 'clara' })
  assert.equal(found.body.length, 1)
  assert.equal(found.body[0].data.atributes['current-pv'], 0)
  assert.equal((await request('agents', 'GET', undefined, token, { q: 'ausente' })).body.length, 0)
  assert.equal((await request(`agents/${id}`, 'DELETE', undefined, token)).statusCode, 204)
  assert.equal((await request(`agents/${id}`, 'GET', undefined, token)).statusCode, 404)
  assert.equal((await request('auth/logout', 'POST', undefined, token)).statusCode, 204)
  assert.equal((await request('agents', 'GET', undefined, token)).statusCode, 401)
})

test('rotas limitadas, validação, isolamento e proteção de vínculos', async () => {
  const { request, store } = fixture()
  const credentials = { email: 'mobile@example.com', password: 'Example!2026' }
  await request('auth/register', 'POST', credentials)
  const token = (await request('auth/login', 'POST', credentials)).body.token
  for (const path of ['threats', 'campaigns', 'homebrews', 'profile', 'objects']) assert.equal((await request(path, 'GET', undefined, token)).statusCode, 404)
  assert.equal((await request('agents')).statusCode, 401)
  assert.equal((await request('agents', 'PATCH', {}, token)).statusCode, 405)
  assert.equal((await request('agents', 'POST', {}, token)).statusCode, 422)
  const id = (await request('agents', 'POST', template, token)).body._id
  const other = { email: 'other@example.com', password: 'Example!2026' }
  await request('auth/register', 'POST', other)
  const otherToken = (await request('auth/login', 'POST', other)).body.token
  assert.equal((await request('agents', 'GET', undefined, otherToken)).body.length, 0)
  for (const method of ['GET', 'PUT', 'DELETE']) assert.equal((await request(`agents/${id}`, method, method === 'PUT' ? template : undefined, otherToken)).statusCode, 404)
  store.records.push({ _id: 'a'.repeat(24), kind: 'campaigns', data: { users: [id] } })
  assert.equal((await request(`agents/${id}`, 'DELETE', undefined, token)).statusCode, 409)
})
