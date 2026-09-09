export type AdminUser = {
  id: number
  username: string
  name: string
  isActive: boolean
}

export type AdminUsersSearch = {
  page: number
  limit: number
  search: string
}

export type AdminUserInput = {
  username: string
  name: string
  password?: string
}
