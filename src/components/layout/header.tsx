import { useEffect, useState } from 'react'
import { useLocation } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'z-50 h-16',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        offset > 10 && fixed ? 'shadow' : 'shadow-none',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-full items-center gap-3 p-4 sm:gap-4',
          offset > 10 &&
            fixed &&
            'after:absolute after:inset-0 after:-z-10 after:bg-background/20 after:backdrop-blur-lg'
        )}
      >
        <SidebarTrigger variant='outline' className='max-md:scale-125' />
        <Separator orientation='vertical' className='h-6' />
        <HeaderContext pathname={pathname} />
        <div className='ms-auto flex min-w-0 flex-1 items-center justify-end gap-2'>
          {children}
        </div>
      </div>
    </header>
  )
}

function HeaderContext({ pathname }: { pathname: string }) {
  const label = getPageLabel(pathname)
  return (
    <nav
      aria-label='Lokasi halaman'
      className='hidden min-w-0 items-center gap-1.5 text-sm md:flex'
    >
      <span className='text-muted-foreground'>Amtsilati</span>
      <ChevronRight
        className='size-3.5 text-muted-foreground'
        aria-hidden='true'
      />
      <span className='max-w-40 truncate font-medium'>{label}</span>
    </nav>
  )
}

function getPageLabel(pathname: string) {
  if (pathname === '/') return 'Dashboard'
  if (pathname.startsWith('/admin-users')) return 'Admin Users'
  if (pathname.startsWith('/students')) return 'Students'
  if (pathname.startsWith('/syahriyah')) return 'Syahriyah'
  if (pathname.startsWith('/store/products')) return 'Store'
  if (pathname.startsWith('/events')) return 'Calendar Events'
  if (pathname.startsWith('/payments')) return 'Payments'
  if (pathname.startsWith('/settings/appearance')) return 'Appearance'
  if (pathname.startsWith('/settings')) return 'Profile'
  return 'Admin Panel'
}
