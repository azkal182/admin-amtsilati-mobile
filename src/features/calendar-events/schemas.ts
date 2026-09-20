import * as z from 'zod'

const categoryCodes = [
  'ISLAMIC',
  'NATIONAL',
  'ACADEMIC',
  'PESANTREN',
  'PAYMENT',
  'HOLIDAY',
  'ANNOUNCEMENT',
  'OTHER',
] as const

const dateRuleSchema = z
  .object({
    basis: z.enum(['GREGORIAN', 'HIJRI']),
    recurrence: z.enum(['ONCE', 'YEARLY']),
    gregorian: z
      .object({
        month: z.coerce.number().int().min(1).max(12).optional(),
        day: z.coerce.number().int().min(1).max(31).optional(),
        date: z.string().optional(),
      })
      .optional(),
    hijri: z
      .object({
        year: z.coerce.number().int().min(1).optional(),
        month: z.coerce.number().int().min(1).max(12).optional(),
        day: z.coerce.number().int().min(1).max(30).optional(),
      })
      .optional(),
    range: z
      .object({
        startYear: z.coerce.number().int().min(1).nullable().optional(),
        endYear: z.coerce.number().int().min(1).nullable().optional(),
      })
      .optional(),
  })
  .superRefine((value, context) => {
    const hasRange =
      value.range?.startYear != null || value.range?.endYear != null
    if (value.recurrence === 'ONCE' && hasRange) {
      context.addIssue({
        code: 'custom',
        message: 'ONCE tidak boleh memakai range.',
        path: ['range'],
      })
    }
    if (value.basis === 'GREGORIAN') {
      const hasMonthAndDay =
        value.gregorian?.month != null && value.gregorian?.day != null

      if (value.recurrence === 'YEARLY' && !hasMonthAndDay) {
        context.addIssue({
          code: 'custom',
          message: 'Isi bulan dan hari Gregorian untuk event tahunan.',
          path: ['gregorian'],
        })
      }

      if (value.recurrence === 'ONCE' && !value.gregorian?.date) {
        context.addIssue({
          code: 'custom',
          message: 'Isi tanggal Gregorian.',
          path: ['gregorian'],
        })
      }
    }

    if (value.basis === 'HIJRI') {
      const hasMonthAndDay =
        value.hijri?.month != null && value.hijri?.day != null

      if (!hasMonthAndDay) {
        context.addIssue({
          code: 'custom',
          message: 'Isi bulan dan hari Hijri.',
          path: ['hijri'],
        })
      }

      if (value.recurrence === 'ONCE' && value.hijri?.year == null) {
        context.addIssue({
          code: 'custom',
          message: 'Isi tahun Hijri untuk event sekali.',
          path: ['hijri', 'year'],
        })
      }
    }
  })

export const calendarEventSchema = z.object({
  code: z.string().trim().min(1).max(100, 'Kode maksimal 100 karakter.'),
  title: z.string().trim().min(1).max(255, 'Judul maksimal 255 karakter.'),
  summary: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  category: z.object({
    code: z.enum(categoryCodes),
    label: z.string().optional(),
    colorToken: z.string().optional(),
    icon: z.string().optional(),
  }),
  dateRule: dateRuleSchema,
  scope: z.enum(['NATIONAL', 'PESANTREN']),
  location: z.string().nullable().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH']),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
})

export type CalendarEventFormValues = z.infer<typeof calendarEventSchema>
