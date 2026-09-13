import { Link } from '@tanstack/react-router'
import { CreditCard, Settings2, Webhook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export function PaymentsLayout({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <>
      <Header>
        <Search />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main>
        <PageHeader
          eyebrow='Operasional pembayaran'
          title={title}
          description={description}
        />
        <nav className='mb-6 flex flex-wrap gap-2' aria-label='Payments'>
          <Button asChild variant='outline' size='sm'>
            <Link
              to='/payments'
              search={{ status: 'all', limit: 20, offset: 0 }}
            >
              <CreditCard /> Monitoring invoice
            </Link>
          </Button>
          <Button asChild variant='outline' size='sm'>
            <Link to='/payments/consumers'>
              <Webhook /> Webhook consumers
            </Link>
          </Button>
          <Button asChild variant='outline' size='sm'>
            <Link to='/payments/methods'>
              <Settings2 /> Metode pembayaran
            </Link>
          </Button>
        </nav>
        {children}
      </Main>
    </>
  )
}
