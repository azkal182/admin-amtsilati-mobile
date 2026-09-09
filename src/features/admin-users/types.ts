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

export type AdminRole = {
  id: number
  code: string
  name: string
  description: string
  isSystem: boolean
}
export type AdminPermission = {
  id: number
  code: string
  name: string
  description: string
}
export type AdminAccess = { roles: AdminRole[]; permissions: AdminPermission[] }
