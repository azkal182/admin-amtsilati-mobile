import { describe, expect, it, vi } from 'vitest'
import { adminApi } from '@/api/admin-client'
import { getStudent, listStudents, normalizeStudent } from './api'

describe('students API mapping', () => {
  it('normalizes the backend snapshot field casing at the API boundary', () => {
    expect(
      normalizeStudent({
        IDSantri: 'S-1',
        NIS: 'N-1',
        Nama: 'Ali',
        Alamat: 'Jepara',
        Status: 'aktif',
      })
    ).toEqual({
      idSantri: 'S-1',
      nis: 'N-1',
      nama: 'Ali',
      alamat: 'Jepara',
      status: 'aktif',
    })
  })

  it('maps server-side search, status, pagination, and read-only detail endpoints', async () => {
    const get = vi
      .spyOn(adminApi, 'get')
      .mockResolvedValue({ data: [], success: true, meta: {} })
    await listStudents({
      page: 3,
      limit: 20,
      search: 'Ahmad',
      status: 'active',
    })
    await getStudent('santri/7')
    expect(get).toHaveBeenNthCalledWith(1, '/internal/admin/students', {
      params: { page: 3, limit: 20, search: 'Ahmad', status: 'active' },
    })
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/internal/admin/students/santri%2F7'
    )
    vi.restoreAllMocks()
  })
})
