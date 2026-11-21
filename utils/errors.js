import { ZodError } from 'zod'

export function fail(status, message) {
  throw Object.assign(new Error(message), { status })
}

export function handleApiError(error, res) {
  if (error instanceof ZodError)
    return res.status(422).json({
      error: 'Dados inválidos',
      fields: error.issues.map(({ path, message }) => ({ path, message })),
    })
  if (error.code === 11000)
    return res.status(409).json({ error: 'Registro já existe' })
  if (error.status)
    return res.status(error.status).json({ error: error.message })
  console.error('Falha na API:', error.name)
  return res.status(503).json({ error: 'Serviço indisponível' })
}
