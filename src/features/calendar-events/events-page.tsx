import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { CalendarPlus, RefreshCw, Search } from 'lucide-react'
import { ApiRequestError } from '@/api/types'
import { Badge } from '@/components/ui/badge'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { listCalendarEvents } from './api'

export function CalendarEventsPage() {
  const search = useSearch({ from: '/_authenticated/events' })
  const navigate = useNavigate({ from: '/events' })
  const query = useQuery({
    queryKey: ['calendar-events', search],
    queryFn: () => listCalendarEvents(search),
  })
  const events = query.data?.data ?? []
  const forbidden =
    query.error instanceof ApiRequestError && query.error.status === 403
  const updateSearch = (next: Partial<typeof search>) =>
    void navigate({ search: (previous) => ({ ...previous, ...next }) })
  const [pageSearch, setPageSearch] = useState('')

  return (
    <>
      <Header>
        <GlobalSearch />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className='mb-6 flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              Calendar Events
            </h1>
            <p className='text-muted-foreground'>
              Kelola agenda dan event Amtsilati.
            </p>
          </div>
          <Button asChild>
            <Link
              to='/events/new'
              search={{
                page: 1,
                limit: 20,
                scope: 'all',
                category: 'all',
                status: 'all',
              }}
            >
              <CalendarPlus />
              Tambah event
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>Daftar event</span>
              <Button
                variant='ghost'
                size='icon'
                aria-label='Muat ulang'
                onClick={() => void query.refetch()}
                disabled={query.isFetching}
              >
                <RefreshCw className={query.isFetching ? 'animate-spin' : ''} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex flex-wrap gap-2'>
              <Label htmlFor='event-page-search' className='sr-only'>
                Nomor halaman
              </Label>
              <Input
                id='event-page-search'
                className='w-28'
                type='number'
                min='1'
                value={pageSearch}
                onChange={(event) => setPageSearch(event.target.value)}
                placeholder='Halaman'
              />
              <Button
                variant='outline'
                onClick={() =>
                  updateSearch({ page: Math.max(1, Number(pageSearch) || 1) })
                }
              >
                Buka halaman
              </Button>
              <Select
                value={search.scope}
                onValueChange={(value) =>
                  updateSearch({ scope: value as typeof search.scope, page: 1 })
                }
              >
                <SelectTrigger aria-label='Filter scope' className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Semua scope</SelectItem>
                  <SelectItem value='NATIONAL'>Nasional</SelectItem>
                  <SelectItem value='PESANTREN'>Pesantren</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={search.status}
                onValueChange={(value) =>
                  updateSearch({
                    status: value as typeof search.status,
                    page: 1,
                  })
                }
              >
                <SelectTrigger aria-label='Filter status' className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Semua status</SelectItem>
                  <SelectItem value='DRAFT'>Draft</SelectItem>
                  <SelectItem value='PUBLISHED'>Published</SelectItem>
                  <SelectItem value='ARCHIVED'>Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={search.category}
                onValueChange={(value) =>
                  updateSearch({
                    category: value as typeof search.category,
                    page: 1,
                  })
                }
              >
                <SelectTrigger aria-label='Filter kategori' className='w-44'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Semua kategori</SelectItem>
                  {[
                    'ISLAMIC',
                    'NATIONAL',
                    'ACADEMIC',
                    'PESANTREN',
                    'PAYMENT',
                    'HOLIDAY',
                    'ANNOUNCEMENT',
                    'OTHER',
                  ].map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant='outline'
                size='icon'
                aria-label='Terapkan filter'
                onClick={() => void query.refetch()}
              >
                <Search />
              </Button>
            </div>
            {query.isPending ? (
              <div className='space-y-3'>
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
              </div>
            ) : forbidden ? (
              <State
                title='Akses ditolak'
                message='Anda tidak memiliki permission events.manage.'
              />
            ) : query.isError ? (
              <State
                title='Gagal memuat event'
                message={query.error.message}
                action={
                  <Button
                    variant='outline'
                    onClick={() => void query.refetch()}
                  >
                    Coba lagi
                  </Button>
                }
              />
            ) : events.length === 0 ? (
              <State
                title='Belum ada event'
                message='Tidak ada event untuk filter yang dipilih.'
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='text-end'>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className='font-medium'>{event.title}</div>
                          <div className='text-xs text-muted-foreground'>
                            {event.code}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline'>
                            {event.category.icon ??
                              categoryFallback[event.category.code].icon}{' '}
                            {event.category.label ??
                              categoryFallback[event.category.code].label}
                          </Badge>
                        </TableCell>
                        <TableCell>{event.scope}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              event.status === 'PUBLISHED'
                                ? 'default'
                                : event.status === 'ARCHIVED'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-end'>
                          <Button asChild variant='outline' size='sm'>
                            <Link
                              to='/events/$id'
                              params={{ id: event.id }}
                              search={{
                                page: 1,
                                limit: 20,
                                scope: 'all',
                                category: 'all',
                                status: 'all',
                              }}
                            >
                              Detail
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className='flex items-center justify-between border-t pt-4 text-sm text-muted-foreground'>
                  <span>
                    {query.data?.pagination?.total_records ?? events.length}{' '}
                    event
                  </span>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={!query.data?.pagination?.prev_page}
                      onClick={() =>
                        updateSearch({
                          page: query.data?.pagination?.prev_page ?? 1,
                        })
                      }
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={!query.data?.pagination?.next_page}
                      onClick={() =>
                        updateSearch({
                          page:
                            query.data?.pagination?.next_page ?? search.page,
                        })
                      }
                    >
                      Berikutnya
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}

function State({
  title,
  message,
  action,
}: {
  title: string
  message: string
  action?: React.ReactNode
}) {
  return (
    <div className='rounded-lg border border-dashed p-8 text-center'>
      <p className='font-medium'>{title}</p>
      <p className='mt-1 text-sm text-muted-foreground'>{message}</p>
      {action && <div className='mt-4'>{action}</div>}
    </div>
  )
}

const categoryFallback = {
  ISLAMIC: { icon: '☪', label: 'Islamic' },
  NATIONAL: { icon: '旗', label: 'National' },
  ACADEMIC: { icon: '✎', label: 'Academic' },
  PESANTREN: { icon: '⌂', label: 'Pesantren' },
  PAYMENT: { icon: '¤', label: 'Payment' },
  HOLIDAY: { icon: '☀', label: 'Holiday' },
  ANNOUNCEMENT: { icon: '!', label: 'Announcement' },
  OTHER: { icon: '•', label: 'Other' },
} as const
