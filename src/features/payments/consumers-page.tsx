import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { ApiRequestError } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/feedback'
import { paymentConsumersApi } from './api'
import { PaymentsLayout } from './layout'
import { usePaymentPermissions } from './permissions'
import { paymentQueryKeys } from './query-keys'
import { paymentWebhookConsumerCreateSchema } from './schemas'

export function PaymentConsumersPage() {
  const access = usePaymentPermissions()
  const client = useQueryClient()
  const [editor, setEditor] = useState(false)
  const [rotateId, setRotateId] = useState<number | null>(null)
  const [secret, setSecret] = useState('')
  const [name, setName] = useState('')
  const [endpointUrl, setEndpointUrl] = useState('')
  const [newSecret, setNewSecret] = useState('')
  useEffect(() => () => setSecret(''), [])
  const query = useQuery({
    queryKey: paymentQueryKeys.consumers(),
    queryFn: paymentConsumersApi.list,
    enabled: access.canRead,
  })
  const create = useMutation({
    mutationFn: () =>
      paymentConsumersApi.create({
        name,
        endpointUrl,
        secret: newSecret,
        eventTypes: ['payment.paid', 'payment.failed'],
        active: true,
      }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: paymentQueryKeys.all })
      setEditor(false)
      setName('')
      setEndpointUrl('')
      setNewSecret('')
      toast.success('Consumer berhasil dibuat.')
    },
  })
  const rotate = useMutation({
    mutationFn: (id: number) => paymentConsumersApi.rotateSecret(id),
    onSuccess: (result) => {
      setRotateId(null)
      setSecret(result.data.secret)
      toast.success(
        'Secret berhasil dirotasi. Salin sekarang karena secret tidak akan ditampilkan lagi.'
      )
    },
  })
  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      paymentConsumersApi.update(id, { active }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: paymentQueryKeys.all })
      toast.success('Status consumer diperbarui.')
    },
  })
  const forbidden =
    access.error instanceof ApiRequestError && access.error.status === 403
  if (access.isPending)
    return (
      <PaymentsLayout
        title='Webhook Consumers'
        description='Kelola tujuan event pembayaran outbound.'
      >
        <LoadingState />
      </PaymentsLayout>
    )
  if (forbidden)
    return (
      <PaymentsLayout
        title='Webhook Consumers'
        description='Kelola tujuan event pembayaran outbound.'
      >
        <ForbiddenState />
      </PaymentsLayout>
    )
  if (access.isError)
    return (
      <PaymentsLayout
        title='Webhook Consumers'
        description='Kelola tujuan event pembayaran outbound.'
      >
        <ErrorState error={access.error} onRetry={access.refetch} />
      </PaymentsLayout>
    )
  return (
    <PaymentsLayout
      title='Webhook Consumers'
      description='Kelola tujuan event pembayaran outbound.'
    >
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            Consumer outbound{' '}
            <div className='flex gap-2'>
              <Button
                variant='ghost'
                size='icon'
                aria-label='Muat ulang'
                onClick={() => void query.refetch()}
              >
                <RefreshCw />
              </Button>
              {access.canManage && (
                <Button onClick={() => setEditor((value) => !value)}>
                  <Plus /> Tambah consumer
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {secret && (
            <div className='rounded-lg border border-amber-500/50 bg-amber-500/10 p-4'>
              <p className='font-medium'>Secret baru — salin sekarang</p>
              <p className='mb-2 text-sm text-muted-foreground'>
                Secret ini hanya ditampilkan satu kali.
              </p>
              <code className='block rounded bg-background p-2 text-sm break-all'>
                {secret}
              </code>
              <Button
                className='mt-3'
                variant='outline'
                onClick={() => setSecret('')}
              >
                Tutup
              </Button>
            </div>
          )}
          {editor && (
            <form
              className='grid gap-3 rounded-lg border p-4 md:grid-cols-3'
              onSubmit={(event) => {
                event.preventDefault()
                const result = paymentWebhookConsumerCreateSchema.safeParse({
                  name,
                  endpointUrl,
                  secret: newSecret,
                  eventTypes: ['payment.paid'],
                })
                if (!result.success) {
                  toast.error(result.error.issues[0]?.message)
                  return
                }
                create.mutate()
              }}
            >
              <div>
                <Label htmlFor='consumer-name'>Nama</Label>
                <Input
                  id='consumer-name'
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor='consumer-url'>Endpoint HTTPS</Label>
                <Input
                  id='consumer-url'
                  value={endpointUrl}
                  onChange={(event) => setEndpointUrl(event.target.value)}
                  placeholder='https://...'
                />
              </div>
              <div>
                <Label htmlFor='consumer-secret'>Secret awal</Label>
                <Input
                  id='consumer-secret'
                  type='password'
                  value={newSecret}
                  onChange={(event) => setNewSecret(event.target.value)}
                />
              </div>
              <div className='md:col-span-3'>
                <Button type='submit' disabled={create.isPending}>
                  {create.isPending ? 'Menyimpan...' : 'Simpan consumer'}
                </Button>
              </div>
            </form>
          )}
          {query.isPending ? (
            <LoadingState description='Memuat consumer...' />
          ) : query.isError ? (
            <ErrorState error={query.error} onRetry={query.refetch} />
          ) : !query.data?.data.length ? (
            <EmptyState
              title='Belum ada consumer'
              description='Tambahkan consumer untuk mengaktifkan outbound webhook.'
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-end'>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.data.map((consumer) => (
                  <TableRow key={consumer.id}>
                    <TableCell className='font-medium'>
                      {consumer.name}
                    </TableCell>
                    <TableCell className='max-w-xs truncate'>
                      {consumer.endpointUrl}
                    </TableCell>
                    <TableCell>{consumer.eventTypes.join(', ')}</TableCell>
                    <TableCell>
                      <Badge
                        variant={consumer.active ? 'default' : 'secondary'}
                      >
                        {consumer.active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className='space-x-2 text-end'>
                      {access.canManage && (
                        <>
                          <Button
                            size='sm'
                            variant='outline'
                            disabled={toggle.isPending}
                            onClick={() =>
                              toggle.mutate({
                                id: consumer.id,
                                active: !consumer.active,
                              })
                            }
                          >
                            {consumer.active ? 'Nonaktifkan' : 'Aktifkan'}
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            disabled={rotate.isPending}
                            onClick={() => setRotateId(consumer.id)}
                          >
                            <RotateCcw /> Rotate secret
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={rotateId !== null}
        onOpenChange={(open) => {
          if (!open) setRotateId(null)
        }}
        title='Rotate secret consumer?'
        desc='Secret lama akan tidak berlaku untuk delivery berikutnya. Secret baru hanya akan ditampilkan satu kali.'
        destructive
        confirmText='Rotate secret'
        isLoading={rotate.isPending}
        handleConfirm={() => {
          if (rotateId !== null) rotate.mutate(rotateId)
        }}
      />
    </PaymentsLayout>
  )
}
