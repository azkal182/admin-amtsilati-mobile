import { adminApi } from '@/api/admin-client'
import type { ApiEnvelope, ApiPagination } from '@/api/types'
import type { Student, StudentsSearch } from './types'

type BackendStudent = Partial<Student> & {
  IDSantri?: string
  NIS?: string
  Nama?: string
  Alamat?: string
  Status?: string
}

export function normalizeStudent(student: BackendStudent): Student {
  return {
    idSantri: student.idSantri ?? student.IDSantri ?? '',
    nis: student.nis ?? student.NIS ?? '',
    nama: student.nama ?? student.Nama ?? '',
    alamat: student.alamat ?? student.Alamat ?? '',
    status: student.status ?? student.Status ?? '',
  }
}

export function listStudents(search: StudentsSearch) {
  return adminApi
    .get<BackendStudent[]>('/internal/admin/students', {
      params: {
        page: search.page,
        limit: search.limit,
        ...(search.search ? { search: search.search } : {}),
        ...(search.status ? { status: search.status } : {}),
      },
    })
    .then((response) => ({
      ...response,
      data: response.data.map(normalizeStudent),
    })) as Promise<ApiEnvelope<Student[]> & { pagination?: ApiPagination }>
}

export function getStudent(idSantri: string) {
  return adminApi
    .get<BackendStudent>(
      `/internal/admin/students/${encodeURIComponent(idSantri)}`
    )
    .then((response) => ({
      ...response,
      data: normalizeStudent(response.data),
    }))
}
