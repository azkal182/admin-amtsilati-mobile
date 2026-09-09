export type CalendarBasis = 'GREGORIAN' | 'HIJRI'
export type CalendarRecurrence = 'ONCE' | 'YEARLY'
export type CalendarScope = 'NATIONAL' | 'PESANTREN'
export type CalendarStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type CalendarPriority = 'LOW' | 'NORMAL' | 'HIGH'
export type CalendarCategoryCode =
  | 'ISLAMIC'
  | 'NATIONAL'
  | 'ACADEMIC'
  | 'PESANTREN'
  | 'PAYMENT'
  | 'HOLIDAY'
  | 'ANNOUNCEMENT'
  | 'OTHER'

export type CalendarDateRule = {
  basis: CalendarBasis
  recurrence: CalendarRecurrence
  gregorian?: { month?: number; day?: number; date?: string }
  hijri?: { year?: number; month?: number; day?: number }
  range?: { startYear?: number | null; endYear?: number | null }
}

export type CalendarCategory = {
  code: CalendarCategoryCode
  label?: string
  colorToken?: string
  icon?: string
}

export type CalendarEvent = {
  id: string
  code: string
  title: string
  summary?: string | null
  description?: string | null
  category: CalendarCategory
  dateRule: CalendarDateRule
  reference?: {
    basis: CalendarBasis
    year: number
    usage: 'AGE' | 'ANNIVERSARY_COUNT'
  } | null
  scope: CalendarScope
  location?: string | null
  priority?: CalendarPriority
  status?: CalendarStatus
  updatedAt: string
  createdAt?: string
}

export type CalendarEventInput = Omit<
  CalendarEvent,
  'id' | 'updatedAt' | 'createdAt'
>

export type CalendarEventPatch = Partial<CalendarEventInput>

export type CalendarEventSearch = {
  page: number
  limit: number
  scope: CalendarScope | 'all'
  category: CalendarCategoryCode | 'all'
  status: CalendarStatus | 'all'
}
