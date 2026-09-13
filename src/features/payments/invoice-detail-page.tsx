import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { ApiRequestError } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/feedback'
import {
  getPaymentInvoice,
  listPaymentInvoiceDeliveries,
  listPaymentInvoiceEvents,
  paymentActionsApi,
} from './api'
import { PaymentsLayout } from './layout'
import { usePaymentPermissions } from './permissions'
import { paymentQueryKeys } from './query-keys'

export function PaymentInvoiceDetailPage() {
  const id = Number(useParams({ strict: false }).id)
  const access = usePaymentPermissions()
  const client = useQueryClient()
  const invoice = useQuery({
    queryKey: paymentQueryKeys.invoice(id),
    queryFn: () => getPaymentInvoice(id),
    enabled: access.canRead && Number.isFinite(id),
  })
  const events = useQuery({
    queryKey: paymentQueryKeys.invoiceEvents(id),
    queryFn: () => listPaymentInvoiceEvents(id),
    enabled: access.canRead && Number.isFinite(id),
  })
  const deliveries = useQuery({
    queryKey: paymentQueryKeys.invoiceDeliveries(id),
    queryFn: () => listPaymentInvoiceDeliveries(id),
    enabled: access.canRead && Number.isFinite(id),
  })
  const reconcile = useMutation({
    mutationFn: () => paymentActionsApi.reconcile(id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: paymentQueryKeys.all })
      toast.success('Invoice berhasil direconcile.')
    },
    onError: (error) => {
      if (error instanceof ApiRequestError && error.status === 409) {
        toast.error(
          'Invoice sedang diproses. Coba lagi setelah status terbaru tersedia.'
        )
      }
    },
  })
  const forbidden =
    access.error instanceof ApiRequestError && access.error.status === 403
  if (access.isPending || invoice.isPending)
    return (
      <PaymentsLayout
        title='Detail Invoice'
        description='Detail operasional pembayaran.'
      >
        <LoadingState />
      </PaymentsLayout>
    )
  if (forbidden)
    return (
      <PaymentsLayout
        title='Detail Invoice'
        description='Detail operasional pembayaran.'
      >
        <ForbiddenState />
      </PaymentsLayout>
    )
  if (invoice.error instanceof ApiRequestError && invoice.error.status === 404)
    return (
      <PaymentsLayout
        title='Invoice tidak ditemukan'
        description='Detail operasional pembayaran.'
      >
        <EmptyState
          title='Invoice tidak ditemukan'
          description='Invoice mungkin sudah dihapus atau ID tidak valid.'
        />
      </PaymentsLayout>
    )
  if (invoice.isError || !invoice.data?.data)
    return (
      <PaymentsLayout
        title='Detail Invoice'
        description='Detail operasional pembayaran.'
      >
        <ErrorState error={invoice.error} onRetry={invoice.refetch} />
      </PaymentsLayout>
    )
  const data = invoice.data.data
  return (
    <PaymentsLayout
      title={data.invoice.invoiceNumber}
      description='Detail invoice, attempt, provider event, dan delivery.'
    >
      <div className='mb-4'>
        <Button asChild variant='outline'>
          <Link to='/payments' search={{ status: 'all', limit: 20, offset: 0 }}>
            <ArrowLeft /> Kembali ke monitoring
          </Link>
        </Button>
      </div>
      <div className='grid gap-4 md:grid-cols-4'>
        {[
          ['Santri', data.invoice.idSantri],
          ['Total', `Rp ${data.invoice.totalAmount.toLocaleString('id-ID')}`],
          ['Status', data.invoice.status],
          ['Attempt', String(data.attempts.length)],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm text-muted-foreground'>
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className='font-semibold'>{value}</CardContent>
          </Card>
        ))}
      </div>
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>Items invoice</CardTitle>
        </CardHeader>
        <CardContent>
          {data.invoice.items.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Prefix</TableHead>
                  <TableHead className='text-end'>Qty</TableHead>
                  <TableHead className='text-end'>Harga satuan</TableHead>
                  <TableHead className='text-end'>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className='font-medium'>{item.description}</div>
                      <div className='text-xs text-muted-foreground'>
                        {item.itemCode}
                      </div>
                    </TableCell>
                    <TableCell>{item.itemPrefix}</TableCell>
                    <TableCell className='text-end'>{item.quantity}</TableCell>
                    <TableCell className='text-end'>
                      Rp {item.unitAmount.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className='text-end font-medium'>
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title='Belum ada item invoice' />
          )}
        </CardContent>
      </Card>
      <div className='mt-6 grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex justify-between'>
              Payment attempts{' '}
              {access.canReconcile && data.invoice.status === 'pending' && (
                <Button
                  size='sm'
                  disabled={reconcile.isPending}
                  onClick={() => reconcile.mutate()}
                >
                  Reconcile
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.attempts.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.attempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell>{attempt.provider}</TableCell>
                      <TableCell>{attempt.providerOrderId}</TableCell>
                      <TableCell>
                        {attempt.paymentMethodName} ({attempt.paymentMethodCode}
                        )
                      </TableCell>
                      <TableCell>
                        <Badge>{attempt.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title='Belum ada attempt' />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Provider events</CardTitle>
          </CardHeader>
          <CardContent>
            {events.isError ? (
              <ErrorState error={events.error} onRetry={events.refetch} />
            ) : events.isPending ? (
              <LoadingState />
            ) : events.data?.data.length ? (
              <ul className='space-y-2'>
                {events.data.data.map((event) => (
                  <li key={event.id} className='rounded border p-2 text-sm'>
                    <span className='font-medium'>{event.eventType}</span> ·{' '}
                    {event.processingStatus}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title='Belum ada provider event' />
            )}
          </CardContent>
        </Card>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>Outbound deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            {deliveries.isError ? (
              <ErrorState
                error={deliveries.error}
                onRetry={deliveries.refetch}
              />
            ) : deliveries.isPending ? (
              <LoadingState />
            ) : deliveries.data?.data.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consumer</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Percobaan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.data.data.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>{delivery.consumerName}</TableCell>
                      <TableCell>{delivery.eventType}</TableCell>
                      <TableCell>{delivery.status}</TableCell>
                      <TableCell>{delivery.attemptCount ?? 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title='Belum ada delivery' />
            )}
          </CardContent>
        </Card>
      </div>
    </PaymentsLayout>
  )
}
