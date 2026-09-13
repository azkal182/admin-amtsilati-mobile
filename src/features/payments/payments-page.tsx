import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { ApiRequestError } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
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
  paymentActionsApi,
  getPaymentSummary,
  listPaymentInvoices,
} from './api'
import { PaymentsLayout } from './layout'
import { usePaymentPermissions } from './permissions'
import { paymentQueryKeys } from './query-keys'

const statusLabels = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

export function PaymentsPage() {
  const search = useSearch({ from: '/_authenticated/payments/' })
  const navigate = useNavigate({ from: '/payments/' })
  const client = useQueryClient()
  const access = usePaymentPermissions()
  const summary = useQuery({
    queryKey: paymentQueryKeys.summary(),
    queryFn: getPaymentSummary,
    enabled: access.canRead,
  })
  const invoices = useQuery({
    queryKey: paymentQueryKeys.invoices(search),
    queryFn: () => listPaymentInvoices(search),
    enabled: access.canRead,
  })
  const reconcile = useMutation({
    mutationFn: (id: number) => paymentActionsApi.reconcile(id),
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
  const updateSearch = (status: typeof search.status) =>
    void navigate({
      search: (previous) => ({ ...previous, status, offset: 0 }),
    })
  const data = invoices.data?.data
  const forbidden =
    access.error instanceof ApiRequestError && access.error.status === 403

  if (access.isPending)
    return (
      <PaymentsLayout
        title='Payments'
        description='Monitoring pembayaran dan pengiriman event.'
      >
        <LoadingState description='Memeriksa hak akses Payments...' />
      </PaymentsLayout>
    )
  if (forbidden)
    return (
      <PaymentsLayout
        title='Payments'
        description='Monitoring pembayaran dan pengiriman event.'
      >
        <ForbiddenState />
      </PaymentsLayout>
    )
  if (access.isError)
    return (
      <PaymentsLayout
        title='Payments'
        description='Monitoring pembayaran dan pengiriman event.'
      >
        <ErrorState error={access.error} onRetry={access.refetch} />
      </PaymentsLayout>
    )

  return (
    <PaymentsLayout
      title='Payments'
      description='Monitoring pembayaran dan pengiriman event outbound.'
    >
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {summary.isError ? (
          <div className='sm:col-span-2 lg:col-span-4'>
            <ErrorState error={summary.error} onRetry={summary.refetch} />
          </div>
        ) : (
          Object.entries({
            ...summary.data?.data,
            invoicePending: summary.data?.data.invoicePending,
            invoicePaid: summary.data?.data.invoicePaid,
            invoiceFailed: summary.data?.data.invoiceFailed,
            deliveryFailed: summary.data?.data.deliveryFailed,
          })
            .slice(0, 4)
            .map(([key, value]) => (
              <Card key={key}>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-semibold'>{value ?? '—'}</p>
                </CardContent>
              </Card>
            ))
        )}
      </div>
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            Daftar invoice{' '}
            <Button
              variant='ghost'
              size='icon'
              aria-label='Muat ulang'
              onClick={() => void invoices.refetch()}
              disabled={invoices.isFetching}
            >
              <RefreshCw
                className={invoices.isFetching ? 'animate-spin' : ''}
              />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Select
            value={search.status}
            onValueChange={(value) =>
              updateSearch(value as typeof search.status)
            }
          >
            <SelectTrigger aria-label='Filter status invoice' className='w-48'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Semua status</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {invoices.isPending ? (
            <div className='space-y-3'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </div>
          ) : invoices.isError ? (
            <ErrorState error={invoices.error} onRetry={invoices.refetch} />
          ) : !data?.items.length ? (
            <EmptyState
              title='Belum ada invoice'
              description='Tidak ada invoice untuk filter yang dipilih.'
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Santri</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-end'>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className='font-medium'>
                          {invoice.invoiceNumber}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {new Date(invoice.createdAt).toLocaleString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell>{invoice.idSantri}</TableCell>
                      <TableCell>
                        Rp {invoice.totalAmount.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === 'paid'
                              ? 'default'
                              : invoice.status === 'failed'
                                ? 'destructive'
                                : 'outline'
                          }
                        >
                          {statusLabels[invoice.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className='space-x-2 text-end'>
                        <Button asChild variant='outline' size='sm'>
                          <Link
                            to='/payments/invoices/$id'
                            params={{ id: String(invoice.id) }}
                          >
                            Detail
                          </Link>
                        </Button>
                        {access.canReconcile &&
                          invoice.status === 'pending' && (
                            <Button
                              size='sm'
                              variant='secondary'
                              disabled={reconcile.isPending}
                              onClick={() => reconcile.mutate(invoice.id)}
                            >
                              Reconcile
                            </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className='flex items-center justify-between border-t pt-4 text-sm text-muted-foreground'>
                <span>{data.total} invoice</span>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={data.offset === 0}
                    onClick={() =>
                      void navigate({
                        search: (previous) => ({
                          ...previous,
                          offset: Math.max(0, data.offset - data.limit),
                        }),
                      })
                    }
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={data.offset + data.limit >= data.total}
                    onClick={() =>
                      void navigate({
                        search: (previous) => ({
                          ...previous,
                          offset: data.offset + data.limit,
                        }),
                      })
                    }
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PaymentsLayout>
  )
}
