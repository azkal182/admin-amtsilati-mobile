import { z } from 'zod'

export const periodSchema = z.object({
  hijriPeriod: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Periode harus berformat YYYY-MM.'),
})
export const tariffSchema = periodSchema.extend({
  category: z.string().trim().min(1, 'Kategori wajib diisi.'),
  amount: z.coerce.number().int().nonnegative('Nominal tidak boleh negatif.'),
})
export const assignSchema = z.object({
  idSantri: z.string().min(1, 'Santri wajib dipilih.'),
  startPeriod: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Periode harus berformat YYYY-MM.'),
  note: z.string().optional(),
})
export const releaseSchema = z.object({
  idSantri: z.string().min(1),
  endPeriod: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Periode harus berformat YYYY-MM.'),
  note: z.string().optional(),
})
