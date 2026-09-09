import { z } from 'zod'

export const adminUserSchema = z.object({
  username: z.string().trim().min(3, 'Username minimal 3 karakter.'),
  name: z.string().trim().min(1, 'Nama wajib diisi.'),
  password: z.string().min(8, 'Password minimal 8 karakter.').optional(),
})

export const adminPasswordSchema = z.object({
  password: z.string().min(8, 'Password minimal 8 karakter.'),
})
