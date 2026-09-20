import { describe, expect, it } from 'vitest'
import { calendarEventSchema } from './schemas'

const baseEvent = {
  code: 'HARLAH_ABAH',
  title: 'Harlah KH. Taufiqul Hakim',
  summary: null,
  description: null,
  category: { code: 'PESANTREN' as const },
  scope: 'PESANTREN' as const,
  priority: 'HIGH' as const,
  status: 'PUBLISHED' as const,
}

describe('calendar event date rules', () => {
  it('requires month and day for yearly Gregorian events', () => {
    const result = calendarEventSchema.safeParse({
      ...baseEvent,
      dateRule: {
        basis: 'GREGORIAN',
        recurrence: 'YEARLY',
        gregorian: { date: '1975-06-07' },
      },
    })

    expect(result.success).toBe(false)
  })

  it('accepts month and day for yearly Gregorian events', () => {
    const result = calendarEventSchema.safeParse({
      ...baseEvent,
      dateRule: {
        basis: 'GREGORIAN',
        recurrence: 'YEARLY',
        gregorian: { month: 6, day: 7 },
      },
    })

    expect(result.success).toBe(true)
  })

  it('keeps a full date for one-time Gregorian events', () => {
    const result = calendarEventSchema.safeParse({
      ...baseEvent,
      dateRule: {
        basis: 'GREGORIAN',
        recurrence: 'ONCE',
        gregorian: { date: '1975-06-07' },
      },
    })

    expect(result.success).toBe(true)
  })
})
