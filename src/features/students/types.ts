export type Student = {
  idSantri: string
  nis: string
  nama: string
  alamat: string
  status: string
}

export type StudentsSearch = {
  page: number
  limit: number
  search: string
  status: string
}
