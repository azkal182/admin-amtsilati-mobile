import { z } from 'zod'
import { CONTACT_CATEGORIES } from './types'

export const contactDirectorySchema = z
  .object({
    category: z.enum(CONTACT_CATEGORIES),
    name: z
      .string()
      .trim()
      .min(1, 'Nama kontak wajib diisi.')
      .max(150, 'Nama kontak maksimal 150 karakter.'),
    description: z
      .string()
      .trim()
      .max(1000, 'Deskripsi maksimal 1000 karakter.')
      .optional(),
    whatsappNumber: z
      .string()
      .regex(
        /^[1-9]\d{7,14}$/,
        'Nomor harus 8–15 digit, tanpa tanda plus, dan tidak diawali 0.'
      ),
    displayOrder: z.coerce
      .number()
      .int('Urutan harus berupa bilangan bulat.')
      .min(0, 'Urutan minimal 0.')
      .max(10000, 'Urutan maksimal 10000.'),
    active: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.category === 'layanan_umum_pesantren' && !value.description) {
      context.addIssue({
        code: 'custom',
        path: ['description'],
        message: 'Deskripsi layanan wajib diisi.',
      })
    }
  })
  .transform(({ description, ...value }) =>
    value.category === 'layanan_umum_pesantren'
      ? { ...value, description }
      : value
  )
