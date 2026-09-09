import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

type ModulePlaceholderProps = { title: string; description: string }

export function ModulePlaceholder({
  title,
  description,
}: ModulePlaceholderProps) {
  return (
    <>
      <Header>
        <Search />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main>
        <h1 className='text-2xl font-bold tracking-tight'>{title}</h1>
        <p className='mt-2 text-muted-foreground'>{description}</p>
        <p className='mt-6 rounded-lg border border-dashed p-6 text-sm text-muted-foreground'>
          Modul ini disiapkan pada fase implementasi berikutnya.
        </p>
      </Main>
    </>
  )
}
