import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  Calculator,
  ClipboardList,
  RefreshCw,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { ApiRequestError, type ApiEnvelope } from '@/api/types'
import { handleServerError } from '@/lib/handle-server-error'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { listStudents } from '@/features/students/api'
import { syahriyahApi } from './api'
import {
  assignSchema,
  periodSchema,
  releaseSchema,
  tariffSchema,
} from './schemas'
import type { Pengurus, Snapshot, SyncStatus, Tariff } from './types'

const defaultPeriod = '1447-01'
type QueryState<T> = {
  data?: ApiEnvelope<T>
  isPending: boolean
  isError: boolean
  error: Error | null
  refetch: () => unknown
}
type MutationState<V> = { isPending: boolean; mutate: (value: V) => void }

export function SyahriyahPage() {
  const client = useQueryClient()
  const [period, setPeriod] = useState(defaultPeriod)
  const [tariffPeriod, setTariffPeriod] = useState('')
  const [studentId, setStudentId] = useState('')
  const [syncPolling, setSyncPolling] = useState(false)
  const [syncTimedOut, setSyncTimedOut] = useState(false)
  const [releaseTarget, setReleaseTarget] = useState<string | null>(null)
  const statusQuery = useQuery({
    queryKey: ['syahriyah-sync-status'],
    queryFn: syahriyahApi.syncStatus,
    refetchInterval: (query) => {
      const status = query.state.data?.data.status
      return syncPolling &&
        !syncTimedOut &&
        status !== 'success' &&
        status !== 'failed'
        ? 3000
        : false
    },
  })
  const tariffsQuery = useQuery({
    queryKey: ['syahriyah-tariffs', tariffPeriod],
    queryFn: () => syahriyahApi.tariffs(tariffPeriod),
  })
  const snapshotQuery = useQuery({
    queryKey: ['syahriyah-snapshot', period],
    queryFn: () => syahriyahApi.snapshot(period),
    enabled: periodSchema.safeParse({ hijriPeriod: period }).success,
  })
  const pengurusQuery = useQuery({
    queryKey: ['syahriyah-pengurus', studentId],
    queryFn: () => syahriyahApi.pengurus(studentId),
  })
  const studentsQuery = useQuery({
    queryKey: ['students-picker'],
    queryFn: () =>
      listStudents({ page: 1, limit: 100, search: '', status: '' }),
  })
  const syncMutation = useMutation({
    mutationFn: syahriyahApi.sync,
    onSuccess: () => {
      setSyncPolling(true)
      setSyncTimedOut(false)
      void client.invalidateQueries({ queryKey: ['syahriyah-sync-status'] })
      toast.success('Sync student dimulai.')
    },
    onError: (error) => {
      if (error instanceof ApiRequestError && error.status === 409) {
        toast.error('Sync student sedang berjalan. Tunggu hingga selesai.')
        return
      }
      handleServerError(error)
    },
  })
  const tariffMutation = useMutation({
    mutationFn: syahriyahApi.upsertTariff,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['syahriyah-tariffs'] })
      toast.success('Tarif berhasil disimpan.')
    },
    onError: handleServerError,
  })
  const snapshotMutation = useMutation({
    mutationFn: syahriyahApi.rebuildSnapshot,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['syahriyah-snapshot'] })
      toast.success('Snapshot berhasil dibuat.')
    },
    onError: handleServerError,
  })
  const assignMutation = useMutation({
    mutationFn: syahriyahApi.assign,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['syahriyah-pengurus'] })
      toast.success('Pengurus berhasil di-assign.')
    },
    onError: handleServerError,
  })
  const releaseMutation = useMutation({
    mutationFn: syahriyahApi.release,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['syahriyah-pengurus'] })
      setReleaseTarget(null)
      toast.success('Pengurus berhasil di-release.')
    },
    onError: handleServerError,
  })
  const forbidden = [
    statusQuery,
    tariffsQuery,
    snapshotQuery,
    pengurusQuery,
  ].some(
    (query) =>
      query.error instanceof ApiRequestError && query.error.status === 403
  )
  useEffect(() => {
    if (!syncPolling) return
    const timeout = window.setTimeout(() => setSyncTimedOut(true), 30000)
    return () => window.clearTimeout(timeout)
  }, [syncPolling])
  if (forbidden)
    return (
      <Layout>
        <State
          title='Akses ditolak'
          message='Anda tidak memiliki permission syahriyah.manage.'
        />
      </Layout>
    )
  return (
    <Layout>
      <div className='mb-8 flex flex-wrap items-end justify-between gap-4'>
        <div className='space-y-2'>
          <p className='text-sm font-medium text-primary'>
            Operasional keuangan
          </p>
          <h1 className='text-3xl font-semibold tracking-tight'>Syahriyah</h1>
          <p className='max-w-2xl text-muted-foreground'>
            Kelola sinkronisasi santri, tarif, snapshot pembayaran, dan pengurus
            dari satu workspace.
          </p>
        </div>
        <Badge variant='outline' className='gap-1.5 py-1.5'>
          <span
            className='size-2 rounded-full bg-emerald-500'
            aria-hidden='true'
          />
          Operasional aktif
        </Badge>
      </div>
      <div className='mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <SummaryCard
          icon={Activity}
          label='Student sync'
          value={statusQuery.data?.data.status ?? 'Memuat...'}
        />
        <SummaryCard
          icon={Calculator}
          label='Tarif'
          value={`${tariffsQuery.data?.data.length ?? 0} kategori`}
        />
        <SummaryCard icon={ClipboardList} label='Snapshot' value={period} />
        <SummaryCard
          icon={Users}
          label='Pengurus aktif'
          value={`${pengurusQuery.data?.data.filter((item) => item.isActive).length ?? 0} assignment`}
        />
      </div>
      <Tabs defaultValue='sync' className='min-w-0'>
        <TabsList className='mb-4 grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4'>
          <TabsTrigger value='sync'>
            <Activity />
            Sync santri
          </TabsTrigger>
          <TabsTrigger value='tariffs'>
            <Calculator />
            Tarif
          </TabsTrigger>
          <TabsTrigger value='snapshot'>
            <ClipboardList />
            Snapshot
          </TabsTrigger>
          <TabsTrigger value='pengurus'>
            <Users />
            Pengurus
          </TabsTrigger>
        </TabsList>
        <TabsContent value='sync'>
          <SyncCard
            query={statusQuery}
            mutation={syncMutation}
            timedOut={syncTimedOut}
            polling={
              syncPolling &&
              !syncTimedOut &&
              statusQuery.data?.data.status !== 'success' &&
              statusQuery.data?.data.status !== 'failed'
            }
          />
        </TabsContent>
        <TabsContent value='tariffs'>
          <TariffCard
            query={tariffsQuery}
            period={tariffPeriod}
            setPeriod={setTariffPeriod}
            mutation={tariffMutation}
          />
        </TabsContent>
        <TabsContent value='snapshot'>
          <SnapshotCard
            query={snapshotQuery}
            period={period}
            setPeriod={setPeriod}
            mutation={snapshotMutation}
          />
        </TabsContent>
        <TabsContent value='pengurus'>
          <PengurusCard
            query={pengurusQuery}
            students={studentsQuery.data?.data ?? []}
            studentId={studentId}
            setStudentId={setStudentId}
            assignMutation={assignMutation}
            releaseTarget={releaseTarget}
            setReleaseTarget={setReleaseTarget}
            releaseMutation={releaseMutation}
          />
        </TabsContent>
      </Tabs>
    </Layout>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity
  label: string
  value: string
}) {
  return (
    <div className='flex items-center gap-3 rounded-xl border bg-card p-4'>
      <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
        <Icon className='size-4' aria-hidden='true' />
      </div>
      <div className='min-w-0'>
        <p className='truncate text-xs text-muted-foreground'>{label}</p>
        <p className='truncate text-sm font-semibold capitalize'>{value}</p>
      </div>
    </div>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header>
        <Search />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main>{children}</Main>
    </>
  )
}
function State({ title, message }: { title: string; message: string }) {
  return (
    <div className='rounded-lg border border-dashed p-6 text-center'>
      <p className='font-medium'>{title}</p>
      <p className='mt-1 text-sm text-muted-foreground'>{message}</p>
    </div>
  )
}
function SyncCard({
  query,
  mutation,
  timedOut,
  polling,
}: {
  query: QueryState<SyncStatus>
  mutation: MutationState<void>
  timedOut: boolean
  polling: boolean
}) {
  const data = query.data?.data as
    | {
        status: string
        lastSuccessAt?: string | null
        lastError?: string | null
      }
    | undefined
  return (
    <Card className='min-w-0'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Activity />
          Student sync
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <p className='text-sm text-muted-foreground'>
          Sync snapshot santri ke internal database.
        </p>
        {query.isPending ? (
          <Skeleton className='h-6 w-48' />
        ) : data ? (
          <div className='flex flex-wrap items-center gap-3'>
            <Badge>{data.status}</Badge>
            <span className='text-sm text-muted-foreground'>
              {data.lastSuccessAt ?? 'Belum pernah sukses'}
            </span>
          </div>
        ) : (
          <p className='text-sm text-destructive'>
            Status sync tidak tersedia.
          </p>
        )}
        {data?.lastError && (
          <p className='text-sm text-destructive'>{data.lastError}</p>
        )}
        {timedOut && (
          <State
            title='Sync timeout'
            message='Sync belum selesai dalam 30 detik.'
          />
        )}
        <Button
          disabled={mutation.isPending || polling}
          onClick={() => mutation.mutate()}
        >
          {polling ? <RefreshCw className='animate-spin' /> : <RefreshCw />}{' '}
          {polling ? 'Sync berjalan...' : 'Mulai sync'}
        </Button>
      </CardContent>
    </Card>
  )
}
function TariffCard({
  query,
  period,
  setPeriod,
  mutation,
}: {
  query: QueryState<Tariff[]>
  period: string
  setPeriod: (value: string) => void
  mutation: MutationState<Tariff>
}) {
  const [category, setCategory] = useState('santri_biasa')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const tariffs = (query.data?.data ?? []) as {
    hijriPeriod: string
    category: string
    amount: number
  }[]
  return (
    <Card className='min-w-0'>
      <CardHeader>
        <CardTitle>Tarif Syahriyah</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <form
          className='grid gap-3 sm:grid-cols-3'
          onSubmit={(e) => {
            e.preventDefault()
            const result = tariffSchema.safeParse({
              hijriPeriod: period,
              category,
              amount,
            })
            if (!result.success)
              return setError(
                result.error.issues[0]?.message ?? 'Form tidak valid.'
              )
            setError('')
            mutation.mutate(result.data)
          }}
        >
          <div>
            <Label htmlFor='tariff-period'>Periode</Label>
            <Input
              id='tariff-period'
              placeholder='1447-01'
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor='tariff-category'>Kategori</Label>
            <Input
              id='tariff-category'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor='tariff-amount'>Nominal (IDR)</Label>
            <Input
              id='tariff-amount'
              type='number'
              min='0'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button className='sm:col-span-3' disabled={mutation.isPending}>
            {mutation.isPending ? 'Menyimpan...' : 'Simpan tarif'}
          </Button>
        </form>
        {error && (
          <p role='alert' className='text-sm text-destructive'>
            {error}
          </p>
        )}
        <div className='w-full overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Periode</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className='text-end'>Nominal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tariffs.map((item, index) => (
                <TableRow key={`${item.hijriPeriod}-${item.category}-${index}`}>
                  <TableCell>{item.hijriPeriod}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className='text-end'>
                    Rp {item.amount.toLocaleString('id-ID')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {!query.isPending && tariffs.length === 0 && (
          <State
            title='Belum ada tarif'
            message='Tidak ada tarif untuk filter periode ini.'
          />
        )}
      </CardContent>
    </Card>
  )
}
function SnapshotCard({
  query,
  period,
  setPeriod,
  mutation,
}: {
  query: QueryState<Snapshot>
  period: string
  setPeriod: (value: string) => void
  mutation: MutationState<string>
}) {
  const [error, setError] = useState('')
  const data = query.data?.data as
    | {
        totalObligations: number
        totalPaid: number
        pendingCount: number
        paymentCount: number
      }
    | undefined
  return (
    <Card className='min-w-0'>
      <CardHeader>
        <CardTitle>Monthly snapshot</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <form
          className='flex gap-2'
          onSubmit={(e) => {
            e.preventDefault()
            const result = periodSchema.safeParse({ hijriPeriod: period })
            if (!result.success)
              return setError(
                result.error.issues[0]?.message ?? 'Periode tidak valid.'
              )
            setError('')
            mutation.mutate(period)
          }}
        >
          <div className='flex-1'>
            <Label htmlFor='snapshot-period'>Periode Hijri</Label>
            <Input
              id='snapshot-period'
              placeholder='1447-01'
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>
          <Button className='self-end' disabled={mutation.isPending}>
            {mutation.isPending ? 'Membangun...' : 'Rebuild snapshot'}
          </Button>
        </form>
        {error && (
          <p role='alert' className='text-sm text-destructive'>
            {error}
          </p>
        )}
        {query.isPending ? (
          <Skeleton className='h-20 w-full' />
        ) : data ? (
          <div className='grid grid-cols-2 gap-3 text-sm'>
            <Metric label='Kewajiban' value={data.totalObligations} currency />
            <Metric label='Terbayar' value={data.totalPaid} currency />
            <Metric label='Pending' value={data.pendingCount} />
            <Metric label='Pembayaran' value={data.paymentCount} />
          </div>
        ) : query.error instanceof ApiRequestError &&
          query.error.status === 404 ? (
          <State
            title='Snapshot belum tersedia'
            message='Gunakan rebuild untuk membuat snapshot.'
          />
        ) : query.isError ? (
          <State
            title='Gagal memuat snapshot'
            message={query.error?.message ?? 'Terjadi kesalahan server.'}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}
function Metric({
  label,
  value,
  currency = false,
}: {
  label: string
  value: number
  currency?: boolean
}) {
  return (
    <div className='rounded-lg border p-3'>
      <p className='text-muted-foreground'>{label}</p>
      <p className='text-lg font-semibold'>
        {currency ? 'Rp ' : ''}
        {value.toLocaleString('id-ID')}
      </p>
    </div>
  )
}
function PengurusCard({
  query,
  students,
  studentId,
  setStudentId,
  assignMutation,
  releaseTarget,
  setReleaseTarget,
  releaseMutation,
}: {
  query: QueryState<Pengurus[]>
  students: { idSantri: string; nama: string }[]
  studentId: string
  setStudentId: (value: string) => void
  assignMutation: MutationState<{
    idSantri: string
    startPeriod: string
    note?: string
  }>
  releaseTarget: string | null
  setReleaseTarget: (value: string | null) => void
  releaseMutation: MutationState<{
    idSantri: string
    endPeriod: string
    note?: string
  }>
}) {
  const [startPeriod, setStartPeriod] = useState(defaultPeriod)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const items = (query.data?.data ?? []) as {
    id: number
    idSantri: string
    startPeriod: string
    endPeriod?: string | null
    isActive: boolean
  }[]
  return (
    <Card className='min-w-0'>
      <CardHeader>
        <CardTitle>Pengurus</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <form
          className='grid gap-3 sm:grid-cols-3'
          onSubmit={(e) => {
            e.preventDefault()
            const result = assignSchema.safeParse({
              idSantri: studentId,
              startPeriod,
              note,
            })
            if (!result.success)
              return setError(
                result.error.issues[0]?.message ?? 'Form tidak valid.'
              )
            setError('')
            assignMutation.mutate(result.data)
          }}
        >
          <div className='sm:col-span-3'>
            <Label htmlFor='pengurus-student'>Pilih santri</Label>
            <select
              id='pengurus-student'
              className='h-9 w-full rounded-md border bg-background px-3 text-sm'
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value=''>Pilih santri...</option>
              {students.map((student) => (
                <option key={student.idSantri} value={student.idSantri}>
                  {student.idSantri} — {student.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor='pengurus-start'>Mulai periode</Label>
            <Input
              id='pengurus-start'
              value={startPeriod}
              onChange={(e) => setStartPeriod(e.target.value)}
            />
          </div>
          <div className='sm:col-span-2'>
            <Label htmlFor='pengurus-note'>Catatan</Label>
            <Input
              id='pengurus-note'
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <Button className='sm:col-span-3' disabled={assignMutation.isPending}>
            {assignMutation.isPending ? 'Menyimpan...' : 'Assign pengurus'}
          </Button>
        </form>
        {error && (
          <p role='alert' className='text-sm text-destructive'>
            {error}
          </p>
        )}
        <div className='w-full overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Santri</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-end'>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.idSantri}</TableCell>
                  <TableCell>
                    {item.startPeriod} — {item.endPeriod ?? 'sekarang'}
                  </TableCell>
                  <TableCell>
                    <Badge>{item.isActive ? 'Aktif' : 'Selesai'}</Badge>
                  </TableCell>
                  <TableCell className='text-end'>
                    {item.isActive && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setReleaseTarget(item.idSantri)}
                      >
                        Release
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {!query.isPending && items.length === 0 && (
          <State
            title='Belum ada pengurus aktif'
            message='Pilih santri untuk membuat assignment baru.'
          />
        )}
        <ConfirmDialog
          open={!!releaseTarget}
          onOpenChange={(open) => {
            if (!open) setReleaseTarget(null)
          }}
          title='Release pengurus?'
          desc='Aksi ini menutup periode pengurus aktif dan membutuhkan konfirmasi.'
          confirmText={releaseMutation.isPending ? 'Memproses...' : 'Release'}
          destructive
          isLoading={releaseMutation.isPending}
          handleConfirm={() => {
            if (releaseTarget) {
              const result = releaseSchema.safeParse({
                idSantri: releaseTarget,
                endPeriod: startPeriod,
                note: 'Released dari panel admin',
              })
              if (result.success) releaseMutation.mutate(result.data)
            }
          }}
        />
      </CardContent>
    </Card>
  )
}
