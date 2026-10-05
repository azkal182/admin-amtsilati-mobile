export const CONTACT_CATEGORIES = [
  'humas_asrama',
  'layanan_umum_pesantren',
] as const

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number]

export type ContactDirectoryItem = {
  id: string
  category: ContactCategory
  name: string
  description?: string
  whatsappNumber: string
  displayOrder: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type ContactDirectoryInput = {
  category: ContactCategory
  name: string
  description?: string
  whatsappNumber: string
  displayOrder: number
  active: boolean
}

export type ContactDirectoryDelete = {
  id: string
  status: 'DELETED'
}
