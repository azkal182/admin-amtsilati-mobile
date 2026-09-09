import { adminApi } from '@/api/admin-client'
import type { ApiEnvelope } from '@/api/types'
import type { Pengurus, Snapshot, SyncStatus, Tariff } from './types'

type BackendPengurus = Partial<Pengurus> & {
  ID?: number
  IDSantri?: string
  StartPeriod?: string
  EndPeriod?: string | null
  IsActive?: boolean
  Note?: string
}
export function normalizePengurus(item: BackendPengurus): Pengurus {
  return {
    id: item.id ?? item.ID ?? 0,
    idSantri: item.idSantri ?? item.IDSantri ?? '',
    startPeriod: item.startPeriod ?? item.StartPeriod ?? '',
    endPeriod: item.endPeriod ?? item.EndPeriod,
    isActive: item.isActive ?? item.IsActive ?? false,
    note: item.note ?? item.Note ?? '',
  }
}

export const syahriyahApi = {
  sync: () =>
    adminApi.post<{ started: boolean }>(
      '/internal/admin/syahriyah/sync/students'
    ),
  syncStatus: () =>
    adminApi.get<SyncStatus>('/internal/admin/syahriyah/sync/students/status'),
  tariffs: (hijriPeriod?: string) =>
    adminApi.get<Tariff[]>('/internal/admin/syahriyah/tariffs', {
      params: { limit: 100, ...(hijriPeriod ? { hijriPeriod } : {}) },
    }),
  upsertTariff: (input: Tariff) =>
    adminApi.post<{ saved: boolean }>(
      '/internal/admin/syahriyah/tariffs',
      input
    ),
  rebuildSnapshot: (hijriPeriod: string) =>
    adminApi.post<Snapshot>('/internal/admin/syahriyah/snapshots/rebuild', {
      hijriPeriod,
    }),
  snapshot: (hijriPeriod: string) =>
    adminApi.get<Snapshot>('/internal/admin/syahriyah/snapshots', {
      params: { hijriPeriod },
    }),
  pengurus: (idSantri?: string) =>
    adminApi
      .get<
        BackendPengurus[]
      >('/internal/admin/syahriyah/pengurus', { params: { activeOnly: true, limit: 100, ...(idSantri ? { idSantri } : {}) } })
      .then((response) => ({
        ...response,
        data: response.data.map(normalizePengurus),
      })) as Promise<ApiEnvelope<Pengurus[]>>,
  assign: (input: { idSantri: string; startPeriod: string; note?: string }) =>
    adminApi.post<{ saved: boolean }>(
      '/internal/admin/syahriyah/pengurus/assign',
      input
    ),
  release: (input: { idSantri: string; endPeriod: string; note?: string }) =>
    adminApi.post<{ saved: boolean }>(
      '/internal/admin/syahriyah/pengurus/release',
      input
    ),
}
