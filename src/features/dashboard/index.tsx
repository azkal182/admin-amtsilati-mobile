import {
  Activity,
  BookOpen,
  CalendarDays,
  ShoppingBag,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

const modules = [
  {
    label: 'Admin Users',
    description: 'Pengelolaan pengguna admin',
    icon: Users,
  },
  { label: 'Students', description: 'Snapshot data santri', icon: BookOpen },
  { label: 'Syahriyah', description: 'Operasional pembayaran', icon: Activity },
  { label: 'Store', description: 'Katalog produk', icon: ShoppingBag },
  {
    label: 'Calendar Events',
    description: 'Event kalender',
    icon: CalendarDays,
  },
]

export function Dashboard() {
  return (
    <>
      <Header>
        <Search />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className='mb-6 space-y-1'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Ringkasan operasional Amtsilati.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Modul Administrasi</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {modules.map(({ label, description, icon: Icon }) => (
              <div
                key={label}
                className='flex items-center gap-3 rounded-lg border p-4'
              >
                <Icon className='size-5 text-muted-foreground' />
                <div>
                  <p className='font-medium'>{label}</p>
                  <p className='text-sm text-muted-foreground'>{description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
