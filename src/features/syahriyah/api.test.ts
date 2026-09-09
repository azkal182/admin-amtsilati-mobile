import { describe, expect, it, vi } from 'vitest'
import { adminApi } from '@/api/admin-client'
import { normalizePengurus, syahriyahApi } from './api'

describe('syahriyah API mapping', () => {
  it('normalizes the backend pengurus field casing', () => {
    expect(
      normalizePengurus({
        ID: 1,
        IDSantri: 'S-1',
        StartPeriod: '1447-01',
        IsActive: true,
        Note: 'ok',
      })
    ).toEqual({
      id: 1,
      idSantri: 'S-1',
      startPeriod: '1447-01',
      endPeriod: undefined,
      isActive: true,
      note: 'ok',
    })
  })

  it('uses the admin Syahriyah endpoints without an internal token', async () => {
    const get = vi
      .spyOn(adminApi, 'get')
      .mockResolvedValue({ success: true, data: [], meta: {} })
    const post = vi
      .spyOn(adminApi, 'post')
      .mockResolvedValue({ success: true, data: { saved: true }, meta: {} })
    await syahriyahApi.tariffs('1447-01')
    await syahriyahApi.upsertTariff({
      hijriPeriod: '1447-01',
      category: 'santri_biasa',
      amount: 1000,
    })
    await syahriyahApi.assign({ idSantri: 'S-1', startPeriod: '1447-01' })
    expect(get).toHaveBeenCalledWith('/internal/admin/syahriyah/tariffs', {
      params: { limit: 100, hijriPeriod: '1447-01' },
    })
    expect(post).toHaveBeenNthCalledWith(
      1,
      '/internal/admin/syahriyah/tariffs',
      { hijriPeriod: '1447-01', category: 'santri_biasa', amount: 1000 }
    )
    expect(post).toHaveBeenNthCalledWith(
      2,
      '/internal/admin/syahriyah/pengurus/assign',
      { idSantri: 'S-1', startPeriod: '1447-01' }
    )
    vi.restoreAllMocks()
  })
})
