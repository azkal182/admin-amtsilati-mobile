import { z } from 'zod'

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
    if (
      value.basis === 'GREGORIAN' &&
      !value.gregorian?.date &&
      (!value.gregorian?.month || !value.gregorian?.day)
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Isi tanggal Gregorian.',
        path: ['gregorian'],
      })
    }
    if (value.basis === 'HIJRI' && (!value.hijri?.month || !value.hijri?.day)) {
      context.addIssue({
        code: 'custom',
        message: 'Isi tanggal Hijri.',
        path: ['hijri'],
      })
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
