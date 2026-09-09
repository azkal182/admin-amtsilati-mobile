import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { ApiRequestError } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { getStudent } from './api'

export function StudentDetailPage() {
  const { idSantri } = useParams({ from: '/_authenticated/students/$idSantri' })
  const query = useQuery({
    queryKey: ['student', idSantri],
    queryFn: () => getStudent(idSantri),
  })
  const student = query.data?.data
  const forbidden =
    query.error instanceof ApiRequestError && query.error.status === 403
  const notFound =
    query.error instanceof ApiRequestError && query.error.status === 404
  return (
    <>
      <Header>
        <Search />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className='mb-6 flex flex-wrap items-center gap-3'>
          <Button
            asChild
            variant='ghost'
            size='icon'
            aria-label='Kembali ke daftar santri'
          >
            <Link
              to='/students'
              search={{ page: 1, limit: 20, search: '', status: '' }}
            >
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              Detail Student
            </h1>
            <p className='text-muted-foreground'>
              Snapshot santri bersifat read-only.
            </p>
          </div>
        </div>
        {query.isPending ? (
          <Card>
            <CardContent className='space-y-4 p-6'>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-5 w-full' />
              <Skeleton className='h-5 w-full' />
            </CardContent>
          </Card>
        ) : forbidden ? (
          <State
            title='Akses ditolak'
            message='Anda tidak memiliki permission students.read.'
          />
        ) : notFound ? (
          <State
            title='Santri tidak ditemukan'
            message='Snapshot untuk ID santri tersebut tidak tersedia.'
          />
        ) : query.isError || !student ? (
          <State
            title='Gagal memuat detail'
            message={query.error?.message ?? 'Terjadi kesalahan server.'}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{student.nama}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className='grid gap-4 sm:grid-cols-2'>
                <Field label='ID Santri' value={student.idSantri} />
                <Field label='NIS' value={student.nis} />
                <Field label='Alamat' value={student.alamat} />
                <div>
                  <dt className='text-sm text-muted-foreground'>Status</dt>
                  <dd className='mt-1'>
                    <Badge variant='outline'>{student.status}</Badge>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  )
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className='text-sm text-muted-foreground'>{label}</dt>
      <dd className='mt-1'>{value || '—'}</dd>
    </div>
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
