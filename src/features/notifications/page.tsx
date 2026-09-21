import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  Database,
  History,
  List,
  RefreshCw,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { ApiRequestError } from '@/api/types'
import { useAuthStore } from '@/stores/auth-store'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/feedback'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { adminAccessApi } from '@/features/admin-users/api'
import { listStudents } from '@/features/students/api'
import { notificationApi } from './api'
import { notificationQueryKeys } from './query-keys'
import type { NotificationDelivery, NotificationEvent } from './types'

type Tab = 'summary' | 'send' | 'events' | 'installations' | 'audit' | 'cleanup'
const dateValue = (value?: string | null) =>
  value ? new Date(value).toLocaleString('id-ID') : '—'
const listData = <T,>(value: unknown) =>
  (value as { items?: T[] } | undefined)?.items ?? []
const createEventId = () =>
  `admin-${Date.now()}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`

export function NotificationsPage() {
  const userId = useAuthStore((state) => state.auth.user?.id)
  const access = useQuery({
    queryKey: ['admin-access', userId],
    queryFn: () => adminAccessApi.access(userId!),
    enabled: !!userId,
  })
  const permissions = useMemo(
    () => new Set(access.data?.data.permissions.map((item) => item.code) ?? []),
    [access.data]
  )
  const canRead = permissions.has('notifications.read')
  const [tab, setTab] = useState<Tab>('summary')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  if (access.isPending)
    return (
      <Shell>
        <LoadingState description='Memeriksa hak akses Notification Operations...' />
      </Shell>
    )
  if (access.error instanceof ApiRequestError && access.error.status === 403)
    return (
      <Shell>
        <ForbiddenState />
      </Shell>
    )
  if (access.isError)
    return (
      <Shell>
        <ErrorState error={access.error} onRetry={access.refetch} />
      </Shell>
    )
  if (
    !canRead &&
    !permissions.has('notifications.delivery.read') &&
    !permissions.has('notifications.installations.read') &&
    !permissions.has('notifications.audit.read') &&
    !permissions.has('notifications.cleanup')
  )
    return (
      <Shell>
        <ForbiddenState />
      </Shell>
    )
  return (
    <Shell>
      <div
        className='mb-6 flex flex-wrap gap-2'
        role='tablist'
        aria-label='Notification Operations'
      >
        <TabButton
          active={tab === 'summary'}
          onClick={() => setTab('summary')}
          icon={<Bell />}
        >
          Summary
        </TabButton>
        {permissions.has('notifications.send') && (
          <TabButton
            active={tab === 'send'}
            onClick={() => setTab('send')}
            icon={<Bell />}
          >
            Send notification
          </TabButton>
        )}
        <TabButton
          active={tab === 'events'}
          onClick={() => setTab('events')}
          icon={<List />}
        >
          Events
        </TabButton>
        {permissions.has('notifications.installations.read') && (
          <TabButton
            active={tab === 'installations'}
            onClick={() => setTab('installations')}
            icon={<Database />}
          >
            Installations
          </TabButton>
        )}
        {permissions.has('notifications.audit.read') && (
          <TabButton
            active={tab === 'audit'}
            onClick={() => setTab('audit')}
            icon={<History />}
          >
            Audit
          </TabButton>
        )}
        {permissions.has('notifications.cleanup') && (
          <TabButton
            active={tab === 'cleanup'}
            onClick={() => setTab('cleanup')}
            icon={<Trash2 />}
          >
            Cleanup
          </TabButton>
        )}
      </div>
      {tab === 'summary' && (
        <SummaryTab enabled={permissions.has('notifications.read')} />
      )}
      {tab === 'send' && <SendTab />}
      {tab === 'events' && (
        <EventsTab
          enabled={permissions.has('notifications.read')}
          selectedId={selectedId}
          onSelect={setSelectedId}
          canDelivery={permissions.has('notifications.delivery.read')}
          canRetry={permissions.has('notifications.delivery.retry')}
        />
      )}
      {tab === 'installations' && (
        <InstallationsTab
          enabled={permissions.has('notifications.installations.read')}
        />
      )}
      {tab === 'audit' && (
        <AuditTab enabled={permissions.has('notifications.audit.read')} />
      )}
      {tab === 'cleanup' && <CleanupTab />}
    </Shell>
  )
}

function SendTab() {
  const [category, setCategory] = useState<'general' | 'user'>('general')
  const [eventId, setEventId] = useState(createEventId)
  const [eventType, setEventType] = useState('announcement.test')
  const [title, setTitle] = useState('Test notification')
  const [body, setBody] = useState('Pengujian dari admin panel')
  const [resourceId, setResourceId] = useState('')
  const [screen, setScreen] = useState('notifications')
  const [studentSearch, setStudentSearch] = useState('')
  const [studentId, setStudentId] = useState('')
  const debouncedSearch = useDebouncedValue(studentSearch)
  const students = useQuery({
    queryKey: ['notification-student-picker', debouncedSearch],
    queryFn: () =>
      listStudents({ page: 1, limit: 20, search: debouncedSearch, status: '' }),
    enabled: category === 'user' && debouncedSearch.trim().length >= 2,
  })
  const send = useMutation({
    mutationFn: () => {
      if (
        !eventType.trim() ||
        !title.trim() ||
        !body.trim() ||
        (category === 'user' && !studentId)
      )
        throw new Error(
          'Lengkapi kategori, student, event type, title, dan body.'
        )
      return notificationApi.send({
        schemaVersion: 1,
        eventId: eventId.trim(),
        category,
        ...(category === 'user' ? { idSantri: studentId } : {}),
        eventType: eventType.trim(),
        content: { title: title.trim(), body: body.trim() },
        metadata: {
          ...(resourceId.trim() ? { resourceId: resourceId.trim() } : {}),
          ...(screen.trim() ? { target: { screen: screen.trim() } } : {}),
        },
      })
    },
    onSuccess: (result) =>
      toast.success(
        result.data.duplicate
          ? 'Event duplicate/idempotent: payload sudah pernah diterima.'
          : 'Event queued untuk diproses.'
      ),
    onError: (error) => {
      if (error instanceof ApiRequestError && error.status === 409)
        toast.error(
          error.code === 'IDEMPOTENCY_CONFLICT'
            ? 'Event ID sudah dipakai untuk payload berbeda.'
            : error.message
        )
      else
        toast.error(
          error instanceof Error
            ? error.message
            : 'Pengiriman notification gagal.'
        )
    },
  })
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kirim notification melalui source admin-panel</CardTitle>
        <p className='text-sm text-muted-foreground'>
          Request memakai admin JWT. Service token producer tidak pernah dikirim
          ke browser. Gunakan event ID yang sama untuk menguji
          replay/idempotency.
        </p>
      </CardHeader>
      <CardContent className='grid gap-5 md:grid-cols-2'>
        <div>
          <Label>Kategori</Label>
          <Select
            value={category}
            onValueChange={(value) => {
              setCategory(value as typeof category)
              setStudentId('')
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='general'>
                General — semua installation eligible
              </SelectItem>
              <SelectItem value='user'>User — student tertentu</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor='notification-send-event-id'>Event ID</Label>
          <div className='flex gap-2'>
            <Input
              id='notification-send-event-id'
              value={eventId}
              onChange={(event) => setEventId(event.target.value)}
            />
            <Button
              type='button'
              variant='outline'
              onClick={() => setEventId(createEventId())}
            >
              Baru
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor='notification-send-type'>Event type</Label>
          <Input
            id='notification-send-type'
            value={eventType}
            onChange={(event) => setEventType(event.target.value)}
            placeholder='announcement.test'
          />
        </div>
        {category === 'user' && (
          <div>
            <Label htmlFor='notification-send-student-search'>
              Cari student
            </Label>
            <Input
              id='notification-send-student-search'
              value={studentSearch}
              onChange={(event) => setStudentSearch(event.target.value)}
              placeholder='Minimal 2 karakter'
            />
            {students.data && (
              <div className='mt-2 max-h-36 overflow-auto rounded-md border'>
                {students.data.data.map((student) => (
                  <button
                    type='button'
                    key={student.idSantri}
                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-muted ${student.idSantri === studentId ? 'bg-muted' : ''}`}
                    onClick={() => setStudentId(student.idSantri)}
                  >
                    {student.nama} — {student.idSantri}
                  </button>
                ))}
              </div>
            )}
            {studentId && (
              <p className='mt-1 text-xs text-muted-foreground'>
                Dipilih: {studentId}
              </p>
            )}
          </div>
        )}
        <div>
          <Label htmlFor='notification-send-title'>Title</Label>
          <Input
            id='notification-send-title'
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor='notification-send-screen'>Target screen</Label>
          <Input
            id='notification-send-screen'
            value={screen}
            onChange={(event) => setScreen(event.target.value)}
            placeholder='notifications'
          />
        </div>
        <div className='md:col-span-2'>
          <Label htmlFor='notification-send-body'>Body</Label>
          <textarea
            id='notification-send-body'
            className='min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor='notification-send-resource'>
            Resource ID (opsional)
          </Label>
          <Input
            id='notification-send-resource'
            value={resourceId}
            onChange={(event) => setResourceId(event.target.value)}
            placeholder='INV-ADMIN-001'
          />
        </div>
        <div className='flex items-end'>
          <Button onClick={() => send.mutate()} disabled={send.isPending}>
            {send.isPending ? 'Mengirim...' : 'Kirim notification'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header>
        <Search />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main>
        <PageHeader
          eyebrow='Operasional platform'
          title='Notification Operations'
          description='Monitor fanout, delivery provider, installation, audit, dan cleanup notification.'
        />
        {children}
      </Main>
    </>
  )
}
function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size='sm'
      onClick={onClick}
      role='tab'
      aria-selected={active}
    >
      {icon}
      {children}
    </Button>
  )
}
function SummaryTab({ enabled }: { enabled: boolean }) {
  const query = useQuery({
    queryKey: notificationQueryKeys.summary(),
    queryFn: notificationApi.summary,
    enabled,
  })
  if (query.isPending) return <LoadingState />
  if (query.error)
    return <ErrorState error={query.error} onRetry={query.refetch} />
  if (!query.data) return <EmptyState />
  const values = query.data.data
  return (
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
      {Object.entries(values).map(([key, value]) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              {key
                .replace(/[A-Z]/g, (letter) => ` ${letter}`)
                .replace(/^./, (letter) => letter.toUpperCase())}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-semibold'>{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EventsTab({
  enabled,
  selectedId,
  onSelect,
  canDelivery,
  canRetry,
}: {
  enabled: boolean
  selectedId: string | null
  onSelect: (id: string | null) => void
  canDelivery: boolean
  canRetry: boolean
}) {
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [eventId, setEventId] = useState('')
  const [appId, setAppId] = useState('')
  const [principalId, setPrincipalId] = useState('')
  const [occurredAfter, setOccurredAfter] = useState('')
  const [occurredBefore, setOccurredBefore] = useState('')
  const [offset, setOffset] = useState(0)
  const limit = 20
  const search = {
    limit,
    offset,
    ...(category !== 'all' ? { category: category as 'general' | 'user' } : {}),
    ...(status !== 'all' ? { status } : {}),
    ...(eventId ? { eventId } : {}),
    ...(appId ? { appId } : {}),
    ...(principalId ? { principalId } : {}),
    ...(occurredAfter
      ? { occurredAfter: new Date(occurredAfter).toISOString() }
      : {}),
    ...(occurredBefore
      ? { occurredBefore: new Date(occurredBefore).toISOString() }
      : {}),
  }
  const query = useQuery({
    queryKey: notificationQueryKeys.events(search),
    queryFn: () => notificationApi.events(search),
    enabled,
  })
  const detail = useQuery({
    queryKey: notificationQueryKeys.event(selectedId ?? ''),
    queryFn: () => notificationApi.event(selectedId!),
    enabled: !!selectedId && enabled,
  })
  const deliveries = useQuery({
    queryKey: notificationQueryKeys.deliveries(selectedId ?? ''),
    queryFn: () => notificationApi.deliveries(selectedId!),
    enabled: !!selectedId && canDelivery,
  })
  const retry = useMutation({
    mutationFn: ({ id, key }: { id: string; key: string }) =>
      notificationApi.retry(id, key),
    onSuccess: () => {
      void deliveries.refetch()
      toast.success('Retry delivery dijadwalkan.')
    },
    onError: (error) => {
      if (error instanceof ApiRequestError && error.status === 409)
        toast.error(
          error.code === 'DELIVERY_NOT_RETRYABLE'
            ? 'Delivery tidak eligible untuk retry.'
            : 'Request retry bentrok. Gunakan Idempotency-Key yang sama.'
        )
    },
  })
  if (query.isPending) return <LoadingState />
  if (query.error)
    return <ErrorState error={query.error} onRetry={query.refetch} />
  const events = listData<NotificationEvent>(query.data?.data)
  return (
    <div className='space-y-6'>
      <Card>
        <CardContent className='flex flex-wrap items-end gap-3 pt-6'>
          <div>
            <Label htmlFor='notification-event-id'>Event ID</Label>
            <Input
              id='notification-event-id'
              value={eventId}
              onChange={(event) => {
                setEventId(event.target.value)
                setOffset(0)
              }}
              placeholder='Cari event ID'
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value)
                setOffset(0)
              }}
            >
              <SelectTrigger className='w-40'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Semua status</SelectItem>
                <SelectItem value='queued'>Queued</SelectItem>
                <SelectItem value='processed'>Processed</SelectItem>
                <SelectItem value='failed'>Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Kategori</Label>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value)
                setOffset(0)
              }}
            >
              <SelectTrigger className='w-40'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Semua kategori</SelectItem>
                <SelectItem value='general'>General</SelectItem>
                <SelectItem value='user'>User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor='notification-app-id'>App ID</Label>
            <Input
              id='notification-app-id'
              value={appId}
              onChange={(event) => {
                setAppId(event.target.value)
                setOffset(0)
              }}
              placeholder='App ID'
            />
          </div>
          <div>
            <Label htmlFor='notification-principal-id'>Principal ID</Label>
            <Input
              id='notification-principal-id'
              value={principalId}
              onChange={(event) => {
                setPrincipalId(event.target.value)
                setOffset(0)
              }}
              placeholder='Principal ID'
            />
          </div>
          <div>
            <Label htmlFor='notification-occurred-after'>Dari</Label>
            <Input
              id='notification-occurred-after'
              type='datetime-local'
              value={occurredAfter}
              onChange={(event) => {
                setOccurredAfter(event.target.value)
                setOffset(0)
              }}
            />
          </div>
          <div>
            <Label htmlFor='notification-occurred-before'>Sampai</Label>
            <Input
              id='notification-occurred-before'
              type='datetime-local'
              value={occurredBefore}
              onChange={(event) => {
                setOccurredBefore(event.target.value)
                setOffset(0)
              }}
            />
          </div>
          <Button variant='outline' onClick={() => void query.refetch()}>
            <RefreshCw /> Muat ulang
          </Button>
        </CardContent>
      </Card>
      {events.length === 0 ? (
        <EmptyState title='Belum ada event notification' />
      ) : (
        <Card>
          <CardContent className='pt-6'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>App</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.notificationId}>
                    <TableCell>
                      <div className='font-medium'>{event.eventType}</div>
                      <div className='text-xs text-muted-foreground'>
                        {event.eventId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>{event.category}</Badge>
                    </TableCell>
                    <TableCell>{event.appId}</TableCell>
                    <TableCell>{dateValue(event.createdAt)}</TableCell>
                    <TableCell>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => onSelect(event.notificationId)}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardContent className='border-t pt-4'>
            <PaginationControls
              offset={offset}
              limit={limit}
              total={query.data?.data.total ?? 0}
              onOffsetChange={setOffset}
            />
          </CardContent>
        </Card>
      )}
      {selectedId && (
        <Dialog
          open={!!selectedId}
          onOpenChange={(open) => !open && onSelect(null)}
        >
          <DialogContent className='max-h-[90vh] max-w-6xl overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Detail event notification</DialogTitle>
              <DialogDescription>
                Periksa content, metadata, dan delivery. Status provider
                accepted berarti provider menerima pesan, bukan bukti notifikasi
                tampil di perangkat.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-5'>
              {detail.isPending ? (
                <LoadingState />
              ) : detail.error ? (
                <ErrorState error={detail.error} onRetry={detail.refetch} />
              ) : (
                detail.data && (
                  <>
                    <dl className='grid gap-3 text-sm sm:grid-cols-3'>
                      <Info
                        label='Notification ID'
                        value={detail.data.data.notificationId}
                      />
                      <Info label='Event ID' value={detail.data.data.eventId} />
                      <Info
                        label='Principal'
                        value={detail.data.data.principalId ?? '—'}
                      />
                      <Info
                        label='Dibuat'
                        value={dateValue(detail.data.data.createdAt)}
                      />
                      <Info
                        label='Kadaluarsa'
                        value={dateValue(detail.data.data.expiresAt)}
                      />
                    </dl>
                    <pre className='max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs'>
                      {JSON.stringify(
                        {
                          content: detail.data.data.content,
                          metadata: detail.data.data.metadata,
                        },
                        null,
                        2
                      )}
                    </pre>
                    {canDelivery && (
                      <DeliveryTable
                        query={deliveries}
                        canRetry={canRetry}
                        retry={retry.mutate}
                      />
                    )}
                  </>
                )
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
function DeliveryTable({
  query,
  canRetry,
  retry,
}: {
  query: {
    isPending: boolean
    error: unknown
    refetch: () => unknown
    data?: { data?: unknown }
  }
  canRetry: boolean
  retry: (input: { id: string; key: string }) => void
}) {
  if (query.isPending) return <LoadingState description='Memuat delivery...' />
  if (query.error)
    return <ErrorState error={query.error} onRetry={query.refetch} />
  const rows = listData<NotificationDelivery>(query.data?.data)
  if (!rows.length) return <EmptyState title='Belum ada delivery' />
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Platform</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Attempt</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Message ID</TableHead>
          <TableHead>Error</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((delivery) => (
          <TableRow key={delivery.id}>
            <TableCell>
              {delivery.platform} {delivery.appVersion ?? ''}
            </TableCell>
            <TableCell>
              <Badge variant='outline'>{delivery.status}</Badge>
            </TableCell>
            <TableCell>{delivery.attemptCount}</TableCell>
            <TableCell>{delivery.providerStatus ?? '—'}</TableCell>
            <TableCell>{delivery.providerMessageId ?? '—'}</TableCell>
            <TableCell>
              {delivery.failureCode ?? delivery.lastError ?? '—'}
            </TableCell>
            <TableCell>
              {canRetry &&
                ['retry_wait', 'dead_letter'].includes(delivery.status) && (
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={false}
                    onClick={() =>
                      retry({ id: delivery.id, key: crypto.randomUUID() })
                    }
                  >
                    <RotateCcw /> Retry
                  </Button>
                )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
function InstallationsTab({ enabled }: { enabled: boolean }) {
  const [offset, setOffset] = useState(0)
  const [platform, setPlatform] = useState<'all' | 'android' | 'ios'>('all')
  const [stale, setStale] = useState<'all' | 'true' | 'false'>('all')
  const limit = 20
  const search = {
    limit,
    offset,
    ...(platform !== 'all' ? { platform } : {}),
    ...(stale !== 'all' ? { stale: stale === 'true' } : {}),
  }
  const query = useQuery({
    queryKey: notificationQueryKeys.installations(search),
    queryFn: () => notificationApi.installations(search),
    enabled,
  })
  if (query.isPending) return <LoadingState />
  if (query.error)
    return <ErrorState error={query.error} onRetry={query.refetch} />
  const rows = listData<import('./types').NotificationInstallation>(
    query.data?.data
  )
  if (!rows.length) return <EmptyState title='Belum ada installation' />
  return (
    <div className='space-y-4'>
      <Card>
        <CardContent className='flex flex-wrap items-end gap-3 pt-6'>
          <div>
            <Label>Platform</Label>
            <Select
              value={platform}
              onValueChange={(value) => {
                setPlatform(value as typeof platform)
                setOffset(0)
              }}
            >
              <SelectTrigger className='w-36'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Semua</SelectItem>
                <SelectItem value='android'>Android</SelectItem>
                <SelectItem value='ios'>iOS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status stale</Label>
            <Select
              value={stale}
              onValueChange={(value) => {
                setStale(value as typeof stale)
                setOffset(0)
              }}
            >
              <SelectTrigger className='w-36'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Semua</SelectItem>
                <SelectItem value='true'>Stale</SelectItem>
                <SelectItem value='false'>Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className='pt-6'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Installation</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>App</TableHead>
                <TableHead>Permission push</TableHead>
                <TableHead>Last seen</TableHead>
                <TableHead>Stale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.installationId}>
                  <TableCell>{row.installationId}</TableCell>
                  <TableCell>{row.platform}</TableCell>
                  <TableCell>
                    {row.appId} {row.appVersion ?? ''}
                  </TableCell>
                  <TableCell>{row.pushPermission ?? '—'}</TableCell>
                  <TableCell>{dateValue(row.lastSeenAt)}</TableCell>
                  <TableCell>
                    {row.stale ? (
                      <Badge variant='destructive'>Stale</Badge>
                    ) : (
                      <Badge>Aktif</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardContent className='border-t pt-4'>
          <PaginationControls
            offset={offset}
            limit={limit}
            total={query.data?.data.total ?? 0}
            onOffsetChange={setOffset}
          />
        </CardContent>
      </Card>
    </div>
  )
}
function AuditTab({ enabled }: { enabled: boolean }) {
  const [offset, setOffset] = useState(0)
  const limit = 20
  const search = { limit, offset }
  const query = useQuery({
    queryKey: notificationQueryKeys.audit(search),
    queryFn: () => notificationApi.audit(search),
    enabled,
  })
  if (query.isPending) return <LoadingState />
  if (query.error)
    return <ErrorState error={query.error} onRetry={query.refetch} />
  const rows = listData<import('./types').NotificationAudit>(query.data?.data)
  if (!rows.length) return <EmptyState title='Belum ada audit notification' />
  return (
    <Card>
      <CardContent className='pt-6'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>HTTP</TableHead>
              <TableHead>Request ID</TableHead>
              <TableHead>Waktu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.actor ?? '—'}</TableCell>
                <TableCell>{row.action}</TableCell>
                <TableCell>{row.resource}</TableCell>
                <TableCell>{row.statusHttp}</TableCell>
                <TableCell>{row.requestId ?? '—'}</TableCell>
                <TableCell>{dateValue(row.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardContent className='border-t pt-4'>
        <PaginationControls
          offset={offset}
          limit={limit}
          total={query.data?.data.total ?? 0}
          onOffsetChange={setOffset}
        />
      </CardContent>
    </Card>
  )
}
function CleanupTab() {
  const [before, setBefore] = useState('')
  const [confirm, setConfirm] = useState(false)
  const client = useQueryClient()
  const mutation = useMutation({
    mutationFn: (dryRun: boolean) =>
      notificationApi.cleanup({
        ...(before ? { before: new Date(before).toISOString() } : {}),
        dryRun,
      }),
    onSuccess: (result) => {
      if (result.data.dryRun)
        toast.success(`${result.data.affected} record akan dibersihkan.`)
      else {
        toast.success('Cleanup selesai.')
        setConfirm(false)
        void client.invalidateQueries({ queryKey: notificationQueryKeys.all })
      }
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiRequestError ? error.message : 'Cleanup gagal.'
      ),
  })
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Cleanup notification</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            Lakukan dry-run terlebih dahulu. Backend menolak nilai before yang
            berada di masa depan.
          </p>
          <div className='max-w-sm'>
            <Label htmlFor='cleanup-before'>Hapus data sebelum</Label>
            <Input
              id='cleanup-before'
              type='datetime-local'
              value={before}
              onChange={(event) => setBefore(event.target.value)}
            />
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              disabled={mutation.isPending}
              onClick={() => mutation.mutate(true)}
            >
              Dry-run
            </Button>
            <Button
              variant='destructive'
              disabled={mutation.isPending}
              onClick={() => setConfirm(true)}
            >
              <Trash2 /> Jalankan cleanup
            </Button>
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title='Konfirmasi cleanup'
        desc='Cleanup akan menghapus data notification yang sudah expired sesuai batas waktu. Pastikan hasil dry-run sudah ditinjau.'
        confirmText='Jalankan cleanup'
        destructive
        isLoading={mutation.isPending}
        handleConfirm={() => mutation.mutate(false)}
      />
    </>
  )
}
function PaginationControls({
  offset,
  limit,
  total,
  onOffsetChange,
}: {
  offset: number
  limit: number
  total: number
  onOffsetChange: (offset: number) => void
}) {
  const page = Math.floor(offset / limit) + 1
  const pages = Math.max(1, Math.ceil(total / limit))
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground'>
      <span>
        {total === 0
          ? 'Tidak ada data'
          : `Menampilkan ${offset + 1}–${Math.min(offset + limit, total)} dari ${total}`}
      </span>
      <div className='flex items-center gap-2'>
        <span>
          Halaman {page} dari {pages}
        </span>
        <Button
          variant='outline'
          size='sm'
          disabled={offset === 0}
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
        >
          Sebelumnya
        </Button>
        <Button
          variant='outline'
          size='sm'
          disabled={page >= pages}
          onClick={() => onOffsetChange(offset + limit)}
        >
          Berikutnya
        </Button>
      </div>
    </div>
  )
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='font-medium break-all'>{value}</dd>
    </div>
  )
}
