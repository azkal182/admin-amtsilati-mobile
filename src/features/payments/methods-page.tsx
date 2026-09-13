import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/feedback'
import { listPaymentMethods, updatePaymentMethod } from './api'
import { PaymentsLayout } from './layout'
import { PaymentMethodEditor } from './method-editor'
import { usePaymentPermissions } from './permissions'
import { paymentQueryKeys } from './query-keys'
import type { AdminPaymentMethod, PaymentMethodUpdate } from './types'

export function PaymentMethodsPage() {
  const access = usePaymentPermissions()
  const client = useQueryClient()
  const [pendingChange, setPendingChange] = useState<{
    code: string
    active: boolean
  } | null>(null)
  const [editing, setEditing] = useState<AdminPaymentMethod | null>(null)
  const query = useQuery({
    queryKey: paymentQueryKeys.methods(),
    queryFn: listPaymentMethods,
    enabled: access.canRead,
  })
  const mutation = useMutation({
    mutationFn: ({ code, active }: { code: string; active: boolean }) =>
      updatePaymentMethod(code, { active }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: paymentQueryKeys.all })
      toast.success('Metode pembayaran diperbarui.')
    },
  })
  const editMutation = useMutation({
    mutationFn: ({
      code,
      input,
    }: {
      code: string
      input: PaymentMethodUpdate
    }) => updatePaymentMethod(code, input),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: paymentQueryKeys.all })
      setEditing(null)
      toast.success('Metode pembayaran diperbarui.')
    },
  })
  const forbidden =
    access.error instanceof ApiRequestError && access.error.status === 403
  if (access.isPending)
    return (
      <PaymentsLayout
        title='Metode Pembayaran'
        description='Kelola status dan urutan metode Direct Payment.'
      >
        <LoadingState />
      </PaymentsLayout>
    )
  if (forbidden)
    return (
      <PaymentsLayout
        title='Metode Pembayaran'
        description='Kelola status dan urutan metode Direct Payment.'
      >
        <ForbiddenState />
      </PaymentsLayout>
    )
  if (access.isError)
    return (
      <PaymentsLayout
        title='Metode Pembayaran'
        description='Kelola status dan urutan metode Direct Payment.'
      >
        <ErrorState error={access.error} onRetry={access.refetch} />
      </PaymentsLayout>
    )
  return (
    <PaymentsLayout
      title='Metode Pembayaran'
      description='Kelola status dan urutan metode Direct Payment.'
    >
      <Card>
        <CardHeader>
          <CardTitle>Daftar metode</CardTitle>
        </CardHeader>
        <CardContent>
          {editing && (
            <PaymentMethodEditor
              method={editing}
              pending={editMutation.isPending}
              onCancel={() => setEditing(null)}
              onSubmit={(input) =>
                editMutation.mutate({ code: editing.code, input })
              }
            />
          )}
          {query.isPending ? (
            <LoadingState description='Memuat metode pembayaran...' />
          ) : query.isError ? (
            <ErrorState error={query.error} onRetry={query.refetch} />
          ) : !query.data?.data.length ? (
            <EmptyState title='Belum ada metode' />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metode</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Urutan</TableHead>
                  <TableHead>Production</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-end'>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.data.map((method) => (
                  <TableRow key={method.code}>
                    <TableCell>
                      <div className='font-medium'>{method.name}</div>
                      <div className='text-xs text-muted-foreground'>
                        {method.code}
                      </div>
                    </TableCell>
                    <TableCell>{method.provider}</TableCell>
                    <TableCell>{method.displayOrder}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          method.productionApproved ? 'default' : 'secondary'
                        }
                      >
                        {method.productionApproved ? 'Approved' : 'Sandbox'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={method.active ? 'default' : 'secondary'}>
                        {method.active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-end'>
                      {access.canManage && (
                        <Button
                          size='sm'
                          variant='outline'
                          disabled={mutation.isPending}
                          onClick={() =>
                            setPendingChange({
                              code: method.code,
                              active: !method.active,
                            })
                          }
                        >
                          {method.active ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                      )}
                      {access.canManage && (
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => setEditing(method)}
                        >
                          Edit
                        </Button>
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
        open={pendingChange !== null}
        onOpenChange={(open) => {
          if (!open) setPendingChange(null)
        }}
        title={
          pendingChange?.active
            ? 'Aktifkan metode pembayaran?'
            : 'Nonaktifkan metode pembayaran?'
        }
        desc='Perubahan hanya berlaku untuk invoice baru dan tidak membatalkan invoice yang sudah dibuat.'
        destructive={pendingChange?.active === false}
        confirmText={pendingChange?.active ? 'Aktifkan' : 'Nonaktifkan'}
        isLoading={mutation.isPending}
        handleConfirm={() => {
          if (pendingChange) {
            mutation.mutate(pendingChange)
            setPendingChange(null)
          }
        }}
      />
    </PaymentsLayout>
  )
}
