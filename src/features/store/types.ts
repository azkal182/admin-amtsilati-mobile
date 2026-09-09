export type StoreProduct = {
  id: number
  name: string
  description: string
  imageUrl: string
  price: number
  maxBuy: number
  available: boolean
  createdAt: string
  updatedAt: string
}

export type StoreProductInput = Omit<
  StoreProduct,
  'id' | 'createdAt' | 'updatedAt'
>
export type StoreProductSearch = {
  page: number
  limit: number
  search: string
  available: 'all' | 'true' | 'false'
}
export type StoreUploadSign = {
  uploadUrl: string
  cloudName: string
  apiKey: string
  timestamp: number
  signature: string
  folder: string
  expiresAt: string
}
