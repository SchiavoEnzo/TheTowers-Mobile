import { z } from 'zod'
import { obj } from './shared.js'

export const credentials = obj({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((s) => s.toLowerCase()),
  password: z.string().min(10).max(128),
})
