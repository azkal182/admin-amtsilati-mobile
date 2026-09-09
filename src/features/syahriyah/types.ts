export type SyncStatus = {
  key: string
  status: string
  lastRunAt?: string | null
  lastSuccessAt?: string | null
  lastError?: string | null
}
export type Tariff = {
  hijriPeriod: string
  category: string
  amount: number
  createdBy?: string
}
export type Snapshot = {
  hijriPeriod: string
  generatedAt: string
  totalObligations: number
  totalPaid: number
  pendingCount: number
  paymentCount: number
}
export type Pengurus = {
  id: number
  idSantri: string
  startPeriod: string
  endPeriod?: string | null
  isActive: boolean
  note: string
}
export type SyahriyahPeriod = { hijriPeriod: string }
