import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  CircleX,
  Clock3,
  GraduationCap,
  LoaderCircle,
  Package,
  RefreshCw,
  Users,
} from 'lucide-react'
import { ApiRequestError } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { listAdminUsers } from '@/features/admin-users/api'
import { listCalendarEvents } from '@/features/calendar-events/api'
import { listStoreProducts } from '@/features/store/api'
import { listStudents } from '@/features/students/api'
import { syahriyahApi } from '@/features/syahriyah/api'

const dashboardQueries = {
  users: ['dashboard', 'users'],
  students: ['dashboard', 'students'],
  products: ['dashboard', 'products'],
  events: ['dashboard', 'events'],
  sync: ['dashboard', 'sync'],
} as const

export function Dashboard() {
  const queries = {
    users: useQuery({
      queryKey: dashboardQueries.users,
      queryFn: () => listAdminUsers({ page: 1, limit: 1, search: '' }),
    }),
    students: useQuery({
      queryKey: dashboardQueries.students,
      queryFn: () =>
        listStudents({ page: 1, limit: 1, search: '', status: '' }),
    }),
    products: useQuery({
      queryKey: dashboardQueries.products,
      queryFn: () =>
        listStoreProducts({ page: 1, limit: 1, search: '', available: 'all' }),
    }),
    events: useQuery({
      queryKey: dashboardQueries.events,
      queryFn: () =>
        listCalendarEvents({
          page: 1,
          limit: 1,
          scope: 'all',
          category: 'all',
          status: 'all',
        }),
    }),
    sync: useQuery({
      queryKey: dashboardQueries.sync,
      queryFn: syahriyahApi.syncStatus,
    }),
  }
  const isRefreshing = Object.values(queries).some((query) => query.isFetching)
  const refresh = () =>
    void Promise.all(Object.values(queries).map((query) => query.refetch()))

  return (
    <>
      <Header>
        <Search />
        <Button
          variant='ghost'
          size='icon'
          aria-label='Muat ulang ringkasan'
          onClick={refresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={isRefreshing ? 'animate-spin' : ''} />
        </Button>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className='mb-8 flex flex-wrap items-end justify-between gap-4'>
          <div className='space-y-2'>
            <p className='text-sm font-medium text-primary'>Amtsilati Admin</p>
            <h1 className='text-3xl font-semibold tracking-tight'>
              Ringkasan operasional
            </h1>
            <p className='max-w-2xl text-muted-foreground'>
              Pantau data utama dan lanjutkan pekerjaan administrasi dari satu
              ruang kendali.
            </p>
          </div>
          <Badge variant='outline' className='gap-1.5 py-1.5'>
            <span
              className='size-2 rounded-full bg-emerald-500'
              aria-hidden='true'
            />
            Sistem terhubung
          </Badge>
        </div>

        <section aria-labelledby='dashboard-metrics' className='space-y-4'>
          <h2 id='dashboard-metrics' className='sr-only'>
            Metrik operasional
          </h2>
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <MetricCard
              title='Admin users'
              description='Pengguna internal'
              icon={Users}
              query={queries.users}
              href='/admin-users'
            />
            <MetricCard
              title='Santri'
              description='Snapshot santri'
              icon={GraduationCap}
              query={queries.students}
              href='/students'
            />
            <MetricCard
              title='Produk'
              description='Katalog produk'
              icon={Package}
              query={queries.products}
              href='/store/products'
            />
            <MetricCard
              title='Agenda'
              description='Agenda terdaftar'
              icon={CalendarDays}
              query={queries.events}
              href='/events'
            />
          </div>
        </section>

        <div className='mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Activity className='size-5 text-primary' aria-hidden='true' />
                Status operasional
              </CardTitle>
            </CardHeader>
            <CardContent className='grid gap-3 sm:grid-cols-2'>
              <StatusItem
                icon={Activity}
                label='Sync santri'
                query={queries.sync}
                value={queries.sync.data?.data.status}
              />
              <StatusItem
                icon={Clock3}
                label='Snapshot pembayaran'
                description='Periksa periode pada halaman Syahriyah'
                href='/syahriyah'
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aksi cepat</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-2'>
              <QuickAction href='/admin-users' label='Kelola admin users' />
              <QuickAction href='/store/products/new' label='Tambah produk' />
              <QuickAction href='/events/new' label='Tambah event' />
              <QuickAction href='/syahriyah' label='Buka Syahriyah' />
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}

type DashboardQuery = ReturnType<typeof useQuery>

function MetricCard({
  title,
  description,
  icon: Icon,
  query,
  href,
}: {
  title: string
  description: string
  icon: typeof Users
  query: DashboardQuery & {
    data?: { data?: unknown[]; pagination?: { total_records: number } }
  }
  href: string
}) {
  const forbidden =
    query.error instanceof ApiRequestError && query.error.status === 403
  const total =
    query.data?.pagination?.total_records ?? query.data?.data?.length
  return (
    <Card className='transition-colors hover:border-primary/40'>
      <CardContent className='p-5'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
            <Icon className='size-5' aria-hidden='true' />
          </div>
          <Button
            asChild
            variant='ghost'
            size='icon'
            aria-label={`Buka ${title}`}
          >
            <Link to={href}>
              <ArrowUpRight />
            </Link>
          </Button>
        </div>
        <div className='mt-5 space-y-1'>
          <p className='text-sm text-muted-foreground'>{description}</p>
          <p className='text-2xl font-semibold tracking-tight'>
            {query.isPending ? (
              <Skeleton className='h-8 w-16' />
            ) : forbidden ? (
              <span className='text-sm font-medium'>Terbatas</span>
            ) : query.isError ? (
              <span className='text-sm font-medium text-destructive'>
                Gagal dimuat
              </span>
            ) : (
              (total ?? 0).toLocaleString('id-ID')
            )}
          </p>
          <p className='font-medium'>{title}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusItem({
  icon: Icon,
  label,
  value,
  description,
  href,
  query,
}: {
  icon: typeof Activity
  label: string
  value?: string
  description?: string
  href?: string
  query?: DashboardQuery
}) {
  const content = (
    <div className='flex items-start gap-3 rounded-xl border p-4'>
      <Icon
        className='mt-0.5 size-5 text-muted-foreground'
        aria-hidden='true'
      />
      <div className='min-w-0 space-y-1'>
        <p className='font-medium'>{label}</p>
        {query?.isPending ? (
          <Skeleton className='h-5 w-20' />
        ) : query?.isError ? (
          <p className='text-sm text-muted-foreground'>Status tidak tersedia</p>
        ) : value ? (
          <StatusValue value={value} />
        ) : (
          <p className='text-sm text-muted-foreground'>{description}</p>
        )}
      </div>
    </div>
  )
  return href ? (
    <Link
      to={href}
      className='block rounded-xl transition-colors hover:border-primary/50'
    >
      {content}
    </Link>
  ) : (
    content
  )
}

function StatusValue({ value }: { value: string }) {
  const normalized = value.toLowerCase()
  const Icon =
    normalized === 'success'
      ? CheckCircle2
      : normalized === 'failed'
        ? CircleX
        : normalized === 'running'
          ? LoaderCircle
          : CircleAlert
  const color =
    normalized === 'success'
      ? 'text-emerald-500'
      : normalized === 'failed'
        ? 'text-destructive'
        : normalized === 'running'
          ? 'animate-spin text-amber-500'
          : 'text-muted-foreground'

  return (
    <div className='flex items-center gap-2'>
      <Icon className={`size-4 ${color}`} aria-hidden='true' />
      <span className='text-sm capitalize'>{value}</span>
    </div>
  )
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild variant='outline' className='justify-between'>
      <Link to={href}>
        {label}
        <ArrowUpRight aria-hidden='true' />
      </Link>
    </Button>
  )
}
