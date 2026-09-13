import * as z from 'zod'

const httpsUrl = z
  .string()
  .url('URL tidak valid.')
  .refine(
    (value) => value.startsWith('https://'),
    'URL harus menggunakan HTTPS.'
  )

export const paymentInvoiceSearchSchema = z.object({
  status: z
    .enum(['all', 'pending', 'paid', 'failed', 'expired', 'cancelled'])
    .catch('all'),
  limit: z.coerce.number().int().min(1).max(100).catch(20),
  offset: z.coerce.number().int().min(0).catch(0),
})

export const paymentMethodUpdateSchema = z
  .object({
    active: z.boolean().optional(),
    productionApproved: z.boolean().optional(),
    displayOrder: z.coerce.number().int().min(0).max(10000).optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    'Minimal satu perubahan wajib diisi.'
  )

export const paymentWebhookConsumerCreateSchema = z.object({
  name: z.string().trim().min(1, 'Nama consumer wajib diisi.').max(100),
  endpointUrl: httpsUrl,
  secret: z.string().min(16, 'Secret minimal 16 karakter.'),
  eventTypes: z
    .array(z.string().trim().min(1))
    .min(1, 'Minimal satu event wajib dipilih.'),
  active: z.boolean().optional(),
})

export const paymentWebhookConsumerUpdateSchema =
  paymentWebhookConsumerCreateSchema
    .omit({ secret: true })
    .partial()
    .superRefine((value, context) => {
      if (value.eventTypes && value.eventTypes.length === 0) {
        context.addIssue({
          code: 'custom',
          path: ['eventTypes'],
          message: 'Minimal satu event wajib dipilih.',
        })
      }
    })
