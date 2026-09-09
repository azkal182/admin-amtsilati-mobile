import { Outlet } from '@tanstack/react-router'
import { Palette, UserCog } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SidebarNav } from './components/sidebar-nav'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/settings',
    icon: <UserCog size={18} />,
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
    icon: <Palette size={18} />,
  },
]

export function Settings() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main fixed>
        <PageHeader
          eyebrow='Konfigurasi akun'
          title='Pengaturan'
          description='Kelola identitas sesi dan preferensi tampilan panel Amtsilati.'
        />
        <Separator className='mb-6 lg:mb-8' />
        <div className='flex flex-1 flex-col gap-6 overflow-hidden lg:flex-row'>
          <aside className='top-0 lg:sticky lg:w-52 lg:shrink-0'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex w-full min-w-0 overflow-y-hidden'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}
