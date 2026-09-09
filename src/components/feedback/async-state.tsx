import { AlertCircle, Ban, Inbox, LoaderCircle } from 'lucide-react'
import { ApiRequestError } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type StateProps = {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
}

function StateCard({ title, description, icon: Icon, action }: StateProps) {
  return (
    <Card>
      <CardContent className='flex min-h-52 flex-col items-center justify-center gap-3 text-center'>
        <Icon className='size-8 text-muted-foreground' aria-hidden='true' />
        <div className='space-y-1'>
          <h2 className='font-semibold'>{title}</h2>
          <p className='max-w-md text-sm text-muted-foreground'>
            {description}
          </p>
        </div>
        {action}
      </CardContent>
    </Card>
  )
}

export function LoadingState({
  description = 'Memuat data Amtsilati...',
}: {
  description?: string
}) {
  return (
    <StateCard
      title='Memuat data'
      description={description}
      icon={LoaderCircle}
    />
  )
}

export function EmptyState({
  title = 'Belum ada data',
  description = 'Data belum tersedia.',
}: {
  title?: string
  description?: string
}) {
  return <StateCard title={title} description={description} icon={Inbox} />
}

export function ForbiddenState() {
  return (
    <StateCard
      title='Akses ditolak'
      description='Akun Anda tidak memiliki izin untuk mengakses data ini.'
      icon={Ban}
    />
  )
}

export function ErrorState({
  error,
  onRetry,
}: {
  error?: unknown
  onRetry?: () => void
}) {
  const requestId =
    error instanceof ApiRequestError ? error.requestId : undefined
  return (
    <StateCard
      title='Gagal memuat data'
      description={`${error instanceof ApiRequestError ? error.message : 'Terjadi kesalahan pada server.'}${requestId ? ` Request ID: ${requestId}` : ''}`}
      icon={AlertCircle}
      action={
        onRetry ? <Button onClick={onRetry}>Coba lagi</Button> : undefined
      }
    />
  )
}
