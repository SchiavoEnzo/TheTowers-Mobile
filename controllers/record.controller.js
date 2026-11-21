import * as records from '../services/record.service.js'

// As entidades compartilham o CRUD, mas podem acrescentar ações no próprio controller.
export function createRecordController(kind) {
  return {
    async list({ db, user, req, res }) {
      return res.json(await records.listRecords(db, user, kind, req.query))
    },
    async read({ db, user, params, res }) {
      return res.json(await records.getRecord(db, user, kind, params.id))
    },
    async create({ db, user, req, res }) {
      return res.status(201).json(await records.saveRecord(db, user, kind, req.body))
    },
    async update({ db, user, params, req, res }) {
      return res.json(await records.saveRecord(db, user, kind, req.body, params.id))
    },
    async remove({ db, user, params, res }) {
      await records.deleteRecord(db, user, kind, params.id)
      return res.status(204).end()
    },
  }
}
