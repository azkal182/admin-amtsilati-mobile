import { afterEach, describe, expect, it, vi } from 'vitest'
import { adminApi } from '@/api/admin-client'
import { calendarEventsApi, listCalendarEvents } from './api'

describe('calendar events API', () => {
  afterEach(() => vi.restoreAllMocks())

  it('maps list filters to the admin calendar endpoint', async () => {
    const get = vi
      .spyOn(adminApi, 'get')
      .mockResolvedValue({ success: true, data: [], meta: {} })

    await listCalendarEvents({
      page: 2,
      limit: 20,
      scope: 'PESANTREN',
      category: 'ISLAMIC',
      status: 'DRAFT',
    })

    expect(get).toHaveBeenCalledWith('/internal/admin/events', {
      params: {
        page: 2,
        limit: 20,
        scope: 'PESANTREN',
        category: 'ISLAMIC',
        status: 'DRAFT',
      },
    })
  })

  it('uses UUID detail, partial update, and archive endpoints', async () => {
    const get = vi
      .spyOn(adminApi, 'get')
      .mockResolvedValue({ success: true, data: {}, meta: {} })
    const patch = vi
      .spyOn(adminApi, 'patch')
      .mockResolvedValue({ success: true, data: {}, meta: {} })
    const del = vi
      .spyOn(adminApi, 'delete')
      .mockResolvedValue({ success: true, data: {}, meta: {} })
    const id = 'a8e3b4d2-8ed8-4d2d-9e6f-57a2a03f5cf2'

    await calendarEventsApi.get(id)
    await calendarEventsApi.update(id, { status: 'PUBLISHED' })
    await calendarEventsApi.archive(id)

    expect(get).toHaveBeenCalledWith(`/internal/admin/events/${id}`)
    expect(patch).toHaveBeenCalledWith(`/internal/admin/events/${id}`, {
      status: 'PUBLISHED',
    })
    expect(del).toHaveBeenCalledWith(`/internal/admin/events/${id}`)
  })
})
