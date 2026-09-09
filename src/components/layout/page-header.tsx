import type { ReactNode } from 'react'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className='mb-8 flex flex-wrap items-end justify-between gap-4'>
      <div className='min-w-0 space-y-2'>
        {eyebrow && (
          <p className='text-sm font-medium text-primary'>{eyebrow}</p>
        )}
        <h1 className='text-3xl font-semibold tracking-tight'>{title}</h1>
        <p className='max-w-2xl text-muted-foreground'>{description}</p>
      </div>
      {actions && (
        <div className='flex shrink-0 items-center gap-2'>{actions}</div>
      )}
    </div>
  )
}
