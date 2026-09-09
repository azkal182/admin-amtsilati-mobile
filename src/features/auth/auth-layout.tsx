import { ShieldCheck, Sparkles } from 'lucide-react'
import { Logo } from '@/assets/logo'
import { ThemeSwitch } from '@/components/theme-switch'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='relative grid min-h-svh overflow-hidden bg-muted/30 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(120,119,198,0.16),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(120,119,198,0.12),transparent_38%)]' />
      <section className='relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex xl:p-14'>
        <div className='absolute -top-32 -right-32 size-96 rounded-full border border-primary-foreground/10' />
        <div className='absolute -right-20 bottom-16 size-72 rounded-full border border-primary-foreground/10' />
        <div>
          <div className='flex items-center gap-3'>
            <div className='flex size-11 items-center justify-center rounded-xl bg-primary-foreground/10 ring-1 ring-primary-foreground/20'>
              <Logo className='size-6' />
            </div>
            <div>
              <p className='font-semibold tracking-wide'>Amtsilati</p>
              <p className='text-sm text-primary-foreground/65'>
                Admin Console
              </p>
            </div>
          </div>
        </div>
        <div className='relative max-w-xl space-y-7'>
          <div className='flex size-12 items-center justify-center rounded-2xl bg-primary-foreground/10 ring-1 ring-primary-foreground/15'>
            <Sparkles className='size-6' aria-hidden='true' />
          </div>
          <div className='space-y-4'>
            <p className='text-sm font-medium tracking-[0.2em] text-primary-foreground/65 uppercase'>
              Ruang kendali operasional
            </p>
            <h2 className='max-w-lg text-4xl leading-tight font-semibold tracking-tight xl:text-5xl'>
              Kelola operasional Amtsilati dengan lebih terarah.
            </h2>
            <p className='max-w-md text-base leading-7 text-primary-foreground/70'>
              Satu tempat untuk mengelola pengguna, santri, Syahriyah, katalog,
              dan agenda Amtsilati secara aman.
            </p>
          </div>
          <div className='flex items-center gap-3 text-sm text-primary-foreground/75'>
            <ShieldCheck className='size-4' aria-hidden='true' />
            Akses internal dengan autentikasi administrator
          </div>
        </div>
        <p className='text-sm text-primary-foreground/50'>© Amtsilati Admin</p>
      </section>

      <main className='relative flex min-h-svh flex-col'>
        <div className='flex items-center justify-between p-5 sm:p-8 lg:justify-end'>
          <div className='flex items-center gap-2 lg:hidden'>
            <div className='flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
              <Logo className='size-5' />
            </div>
            <span className='font-semibold tracking-tight'>Amtsilati</span>
          </div>
          <ThemeSwitch />
        </div>
        <div className='flex flex-1 items-center justify-center px-5 pb-10 sm:px-8 lg:px-14'>
          <div className='w-full max-w-md'>
            <div className='mb-8 lg:hidden'>
              <p className='mb-2 text-sm font-medium text-primary'>
                Admin Console
              </p>
              <h1 className='text-3xl font-semibold tracking-tight'>
                Selamat datang kembali
              </h1>
              <p className='mt-2 text-muted-foreground'>
                Masuk untuk melanjutkan ke ruang kendali Amtsilati.
              </p>
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
