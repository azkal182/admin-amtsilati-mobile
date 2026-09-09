import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Eye, RefreshCw, Search } from 'lucide-react'
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
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { listStudents } from './api'

export function StudentsPage() {
  const search = useSearch({ from: '/_authenticated/students' })
  const navigate = useNavigate({ from: '/students' })
  const [searchText, setSearchText] = useState(search.search)
  const query = useQuery({
    queryKey: ['students', search],
    queryFn: () => listStudents(search),
  })
  const students = query.data?.data ?? []
  const pagination = query.data?.pagination
  const forbidden =
    query.error instanceof ApiRequestError && query.error.status === 403
  function updateSearch(next: Partial<typeof search>) {
    void navigate({ search: (previous) => ({ ...previous, ...next }) })
  }

  return (
    <>
      <Header>
        <GlobalSearch />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main>
        <PageHeader
          eyebrow='Data santri'
          title='Students'
          description='Snapshot data santri untuk kebutuhan operasional, read-only.'
        />
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between gap-3'>
              <span>Daftar santri</span>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => void query.refetch()}
                disabled={query.isFetching}
                aria-label='Muat ulang'
              >
                <RefreshCw className={query.isFetching ? 'animate-spin' : ''} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <form
              className='flex flex-wrap gap-2'
              onSubmit={(e) => {
                e.preventDefault()
                updateSearch({ search: searchText, page: 1 })
              }}
            >
              <Label htmlFor='student-search' className='sr-only'>
                Cari santri
              </Label>
              <Input
                id='student-search'
                className='max-w-sm'
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder='Cari ID, NIS, atau nama'
              />
              <Select
                value={search.status || 'all'}
                onValueChange={(status) =>
                  updateSearch({
                    status: status === 'all' ? '' : status,
                    page: 1,
                  })
                }
              >
                <SelectTrigger aria-label='Filter status' className='w-40'>
                  <SelectValue placeholder='Semua status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Semua status</SelectItem>
                  <SelectItem value='aktif'>Aktif</SelectItem>
                  <SelectItem value='nonaktif'>Nonaktif</SelectItem>
                </SelectContent>
              </Select>
              <Button type='submit' variant='outline' aria-label='Cari'>
                <Search />
              </Button>
            </form>
            {query.isPending ? (
              <Loading />
            ) : forbidden ? (
              <StateMessage
                title='Akses ditolak'
                message='Anda tidak memiliki permission students.read.'
              />
            ) : query.isError ? (
              <StateMessage
                title='Gagal memuat santri'
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
            ) : students.length === 0 ? (
              <StateMessage
                title='Tidak ada data santri'
                message={
                  search.search || search.status
                    ? 'Tidak ada hasil yang cocok dengan filter.'
                    : 'Snapshot santri belum tersedia.'
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Santri</TableHead>
                      <TableHead>NIS</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='text-end'>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.idSantri}>
                        <TableCell className='font-medium'>
                          {student.idSantri}
                        </TableCell>
                        <TableCell>{student.nis}</TableCell>
                        <TableCell>{student.nama}</TableCell>
                        <TableCell>
                          <Badge variant='outline'>{student.status}</Badge>
                        </TableCell>
                        <TableCell className='text-end'>
                          <Button asChild variant='outline' size='sm'>
                            <Link
                              to='/students/$idSantri'
                              params={{ idSantri: student.idSantri }}
                              search={{
                                page: 1,
                                limit: 20,
                                search: '',
                                status: '',
                              }}
                            >
                              <Eye />
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
                    {pagination?.total_records ?? students.length} santri
                  </span>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={!pagination?.prev_page}
                      onClick={() =>
                        updateSearch({ page: pagination?.prev_page ?? 1 })
                      }
                    >
                      Sebelumnya
                    </Button>
                    <span className='flex items-center px-2'>
                      Halaman {pagination?.current_page ?? search.page} dari{' '}
                      {pagination?.total_pages ?? 1}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={!pagination?.next_page}
                      onClick={() =>
                        updateSearch({
                          page: pagination?.next_page ?? search.page,
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

function Loading() {
  return (
    <div className='space-y-3'>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-10 w-full' />
    </div>
  )
}
function StateMessage({
  title,
  message,
  action,
}: {
  title: string
  message: string
  action?: ReactNode
}) {
  return (
    <div className='rounded-lg border border-dashed p-8 text-center'>
      <p className='font-medium'>{title}</p>
      <p className='mt-1 text-sm text-muted-foreground'>{message}</p>
      {action && <div className='mt-4'>{action}</div>}
    </div>
  )
}
