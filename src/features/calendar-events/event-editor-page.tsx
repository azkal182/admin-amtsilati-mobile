import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Archive } from 'lucide-react'
import { toast } from 'sonner'
import { ApiRequestError } from '@/api/types'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { adminAccessApi } from '@/features/admin-users/api'
import { calendarEventsApi } from './api'
import { calendarEventSchema, type CalendarEventFormValues } from './schemas'
import type {
  CalendarBasis,
  CalendarEvent,
  CalendarEventInput,
  CalendarEventPatch,
  CalendarRecurrence,
} from './types'

const categoryCodes = [
  'ISLAMIC',
  'NATIONAL',
  'ACADEMIC',
  'PESANTREN',
  'PAYMENT',
  'HOLIDAY',
  'ANNOUNCEMENT',
  'OTHER',
] as const

export function CalendarEventEditorPage() {
  const { id } = useParams({ strict: false }) as { id?: string }
  const isNew = !id
  const navigate = useNavigate()
  const client = useQueryClient()
  const user = useAuthStore((state) => state.auth.user)
  const eventQuery = useQuery({
    queryKey: ['calendar-event', id],
    queryFn: () => calendarEventsApi.get(id!),
    enabled: !isNew,
  })
  const accessQuery = useQuery({
    queryKey: ['admin-access', user?.id],
    queryFn: () => adminAccessApi.access(user!.id),
    enabled: !!user?.id,
  })
  const canPublish = (accessQuery.data?.data.permissions ?? []).some(
    (permission) => permission.code === 'events.publish'
  )
  const event = eventQuery.data?.data
  const mutation = useMutation({
    mutationFn: async ({
      values,
      initial,
    }: {
      values: CalendarEventFormValues
      initial?: CalendarEvent
    }) => {
      if (isNew) return calendarEventsApi.create(values as CalendarEventInput)
      const patch = Object.fromEntries(
        Object.entries(values).filter(
          ([key, value]) =>
            JSON.stringify(value) !==
            JSON.stringify(initial?.[key as keyof CalendarEvent])
        )
      ) as CalendarEventPatch
      return calendarEventsApi.update(id!, patch)
    },
    onSuccess: async (result) => {
      await client.invalidateQueries({ queryKey: ['calendar-events'] })
      toast.success(
        isNew ? 'Event berhasil dibuat.' : 'Event berhasil diperbarui.'
      )
      await navigate({
        to: '/events/$id',
        params: { id: result.data.id },
        search: {
          page: 1,
          limit: 20,
          scope: 'all',
          category: 'all',
          status: 'all',
        },
      })
    },
  })
  const archiveMutation = useMutation({
    mutationFn: () => calendarEventsApi.archive(id!),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['calendar-events'] })
      toast.success('Event berhasil diarsipkan.')
      await navigate({
        to: '/events',
        search: {
          page: 1,
          limit: 20,
          scope: 'all',
          category: 'all',
          status: 'all',
        },
      })
    },
  })

  if (!isNew && eventQuery.isPending)
    return (
      <EditorLayout>
        <Skeleton className='h-96 w-full' />
      </EditorLayout>
    )
  if (!isNew && (eventQuery.isError || !event))
    return (
      <EditorLayout>
        <State
          title={
            eventQuery.error instanceof ApiRequestError &&
            eventQuery.error.status === 404
              ? 'Event tidak ditemukan'
              : 'Gagal memuat event'
          }
          message={eventQuery.error?.message ?? 'Data event tidak tersedia.'}
        />
      </EditorLayout>
    )
  return (
    <EditorLayout>
      <EventForm
        initial={event}
        isNew={isNew}
        canPublish={canPublish}
        saving={mutation.isPending || archiveMutation.isPending}
        error={mutation.error?.message ?? archiveMutation.error?.message}
        onSubmit={(values) => mutation.mutate({ values, initial: event })}
        onArchive={() => {
          if (window.confirm('Arsipkan event ini?')) archiveMutation.mutate()
        }}
      />
    </EditorLayout>
  )
}

function EventForm({
  initial,
  isNew,
  canPublish,
  saving,
  error,
  onSubmit,
  onArchive,
}: {
  initial?: CalendarEvent
  isNew: boolean
  canPublish: boolean
  saving: boolean
  error?: string
  onSubmit: (values: CalendarEventFormValues) => void
  onArchive: () => void
}) {
  const [code, setCode] = useState(initial?.code ?? '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [summary, setSummary] = useState(initial?.summary ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [category, setCategory] = useState(initial?.category.code ?? 'OTHER')
  const [scope, setScope] = useState(initial?.scope ?? 'PESANTREN')
  const [priority, setPriority] = useState(initial?.priority ?? 'NORMAL')
  const [status, setStatus] = useState(initial?.status ?? 'DRAFT')
  const [basis, setBasis] = useState<CalendarBasis>(
    initial?.dateRule.basis ?? 'GREGORIAN'
  )
  const [recurrence, setRecurrence] = useState<CalendarRecurrence>(
    initial?.dateRule.recurrence ?? 'ONCE'
  )
  const initialGregorianDate = initial?.dateRule.gregorian?.date
  const [date, setDate] = useState(initialGregorianDate ?? '')
  const [gregorianMonth, setGregorianMonth] = useState(
    String(
      initial?.dateRule.gregorian?.month ??
        initialGregorianDate?.slice(5, 7) ??
        ''
    )
  )
  const [gregorianDay, setGregorianDay] = useState(
    String(
      initial?.dateRule.gregorian?.day ?? initialGregorianDate?.slice(8, 10) ?? ''
    )
  )
  const [hijriYear, setHijriYear] = useState(
    String(initial?.dateRule.hijri?.year ?? '')
  )
  const [hijriMonth, setHijriMonth] = useState(
    String(initial?.dateRule.hijri?.month ?? '')
  )
  const [hijriDay, setHijriDay] = useState(
    String(initial?.dateRule.hijri?.day ?? '')
  )
  const [startYear, setStartYear] = useState(
    String(initial?.dateRule.range?.startYear ?? '')
  )
  const [endYear, setEndYear] = useState(
    String(initial?.dateRule.range?.endYear ?? '')
  )
  const [validationError, setValidationError] = useState('')
  const range = useMemo(
    () =>
      recurrence === 'YEARLY' && (startYear || endYear)
        ? {
            startYear: startYear ? Number(startYear) : null,
            endYear: endYear ? Number(endYear) : null,
          }
        : undefined,
    [endYear, recurrence, startYear]
  )
  function submit(event: React.FormEvent) {
    event.preventDefault()
    setValidationError('')
    const result = calendarEventSchema.safeParse({
      code,
      title,
      summary: summary || null,
      description: description || null,
      category: { code: category },
      scope,
      priority,
      status: canPublish ? status : status === 'PUBLISHED' ? 'DRAFT' : status,
      dateRule: {
        basis,
        recurrence,
        gregorian:
          basis === 'GREGORIAN'
            ? recurrence === 'YEARLY'
              ? {
                  month: Number(gregorianMonth),
                  day: Number(gregorianDay),
                }
              : { date }
            : undefined,
        hijri:
          basis === 'HIJRI'
            ? recurrence === 'YEARLY'
              ? {
                  month: Number(hijriMonth),
                  day: Number(hijriDay),
                }
              : {
                  year: Number(hijriYear),
                  month: Number(hijriMonth),
                  day: Number(hijriDay),
                }
            : undefined,
        range,
      },
    })
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? 'Form tidak valid.')
      return
    }
    onSubmit(result.data)
  }
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <Button
            asChild
            variant='ghost'
            size='icon'
            aria-label='Kembali ke daftar event'
          >
            <Link
              to='/events'
              search={{
                page: 1,
                limit: 20,
                scope: 'all',
                category: 'all',
                status: 'all',
              }}
            >
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <CardTitle>{isNew ? 'Tambah event' : 'Edit event'}</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Aturan tanggal mengikuti kontrak kalender Amtsilati.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form className='grid gap-4' onSubmit={submit}>
          <Field label='Kode' id='event-code' value={code} onChange={setCode} />
          <Field
            label='Judul'
            id='event-title'
            value={title}
            onChange={setTitle}
          />
          <div className='grid gap-2'>
            <Label htmlFor='event-summary'>Ringkasan</Label>
            <Input
              id='event-summary'
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='event-description'>Deskripsi</Label>
            <Textarea
              id='event-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className='grid gap-4 sm:grid-cols-3'>
            <Choice
              id='event-category'
              label='Kategori'
              value={category}
              onChange={(value) => setCategory(value as typeof category)}
              options={categoryCodes.map((value) => [value, value])}
            />
            <Choice
              id='event-scope'
              label='Scope'
              value={scope}
              onChange={(value) => setScope(value as typeof scope)}
              options={[
                ['NATIONAL', 'Nasional'],
                ['PESANTREN', 'Pesantren'],
              ]}
            />
            <Choice
              id='event-priority'
              label='Prioritas'
              value={priority}
              onChange={(value) => setPriority(value as typeof priority)}
              options={[
                ['LOW', 'Low'],
                ['NORMAL', 'Normal'],
                ['HIGH', 'High'],
              ]}
            />
          </div>
          <div className='grid gap-4 rounded-lg border p-4'>
            <p className='font-medium'>Aturan tanggal</p>
            <div className='grid gap-4 sm:grid-cols-2'>
              <Choice
                id='event-basis'
                label='Basis'
                value={basis}
                onChange={(value) => setBasis(value as CalendarBasis)}
                options={[
                  ['GREGORIAN', 'Gregorian'],
                  ['HIJRI', 'Hijri'],
                ]}
              />
              <Choice
                id='event-recurrence'
                label='Perulangan'
                value={recurrence}
                onChange={(value) => setRecurrence(value as CalendarRecurrence)}
                options={[
                  ['ONCE', 'Sekali'],
                  ['YEARLY', 'Tahunan'],
                ]}
              />
            </div>
            {basis === 'GREGORIAN' ? (
              recurrence === 'YEARLY' ? (
                <div className='grid gap-4 sm:grid-cols-2'>
                  <Field
                    label='Bulan Gregorian'
                    id='event-gregorian-month'
                    type='number'
                    min='1'
                    max='12'
                    value={gregorianMonth}
                    onChange={setGregorianMonth}
                  />
                  <Field
                    label='Hari Gregorian'
                    id='event-gregorian-day'
                    type='number'
                    min='1'
                    max='31'
                    value={gregorianDay}
                    onChange={setGregorianDay}
                  />
                </div>
              ) : (
                <Field
                  label='Tanggal Gregorian'
                  id='event-date'
                  type='date'
                  value={date}
                  onChange={setDate}
                />
              )
            ) : (
              <div
                className={
                  recurrence === 'YEARLY'
                    ? 'grid gap-4 sm:grid-cols-2'
                    : 'grid gap-4 sm:grid-cols-3'
                }
              >
                {recurrence === 'ONCE' && (
                  <Field
                    label='Tahun Hijri'
                    id='event-hijri-year'
                    type='number'
                    value={hijriYear}
                    onChange={setHijriYear}
                  />
                )}
                <Field
                  label='Bulan Hijri'
                  id='event-hijri-month'
                  type='number'
                  min='1'
                  max='12'
                  value={hijriMonth}
                  onChange={setHijriMonth}
                />
                <Field
                  label='Hari Hijri'
                  id='event-hijri-day'
                  type='number'
                  min='1'
                  max='30'
                  value={hijriDay}
                  onChange={setHijriDay}
                />
              </div>
            )}
            {recurrence === 'YEARLY' && (
              <div className='grid gap-4 sm:grid-cols-2'>
                <Field
                  label='Range tahun awal (opsional)'
                  id='event-start-year'
                  type='number'
                  value={startYear}
                  onChange={setStartYear}
                />
                <Field
                  label='Range tahun akhir (opsional)'
                  id='event-end-year'
                  type='number'
                  value={endYear}
                  onChange={setEndYear}
                />
              </div>
            )}
          </div>
          <Choice
            id='event-status'
            label='Status'
            value={status}
            onChange={(value) => setStatus(value as typeof status)}
            options={[
              ['DRAFT', 'Draft'],
              [
                'PUBLISHED',
                canPublish ? 'Published' : 'Published (perlu events.publish)',
              ],
              ['ARCHIVED', 'Archived'],
            ]}
            disabledOption={!canPublish ? 'PUBLISHED' : undefined}
          />
          {(validationError || error) && (
            <p role='alert' className='text-sm text-destructive'>
              {validationError || error}
            </p>
          )}
          <div className='flex flex-wrap gap-2'>
            <Button disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan event'}
            </Button>
            {!isNew && initial?.status !== 'ARCHIVED' && (
              <Button
                type='button'
                variant='destructive'
                onClick={onArchive}
                disabled={saving}
              >
                <Archive />
                Arsipkan
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  id,
  value,
  onChange,
  type = 'text',
  min,
  max,
}: {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  type?: string
  min?: string
  max?: string
}) {
  return (
    <div className='grid gap-2'>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
function Choice({
  id,
  label,
  value,
  onChange,
  options,
  disabledOption,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<[string, string]>
  disabledOption?: string
}) {
  return (
    <div className='grid gap-2'>
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(([option, text]) => (
            <SelectItem
              key={option}
              value={option}
              disabled={option === disabledOption}
            >
              {text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
function EditorLayout({ children }: { children: React.ReactNode }) {
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
    <div className='rounded-lg border border-dashed p-8 text-center'>
      <p className='font-medium'>{title}</p>
      <p className='mt-1 text-sm text-muted-foreground'>{message}</p>
    </div>
  )
}
