import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { paymentMethodUpdateSchema } from './schemas'
import type { AdminPaymentMethod, PaymentMethodUpdate } from './types'

export function PaymentMethodEditor({
  method,
  pending,
  onCancel,
  onSubmit,
}: {
  method: AdminPaymentMethod
  pending: boolean
  onCancel: () => void
  onSubmit: (input: PaymentMethodUpdate) => void
}) {
  const [values, setValues] = useState<PaymentMethodUpdate>({
    active: method.active,
    productionApproved: method.productionApproved ?? false,
    displayOrder: method.displayOrder,
  })
  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {method.name}</DialogTitle>
          <DialogDescription>
            Perubahan hanya berlaku untuk invoice baru dan tidak mengubah
            invoice yang sudah dibuat.
          </DialogDescription>
        </DialogHeader>
        <form
          id='payment-method-edit-form'
          className='grid gap-4'
          onSubmit={(event) => {
            event.preventDefault()
            const result = paymentMethodUpdateSchema.safeParse(values)
            if (!result.success) {
              toast.error(result.error.issues[0]?.message)
              return
            }
            onSubmit(result.data)
          }}
        >
          <label className='flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              checked={values.active ?? false}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  active: event.target.checked,
                }))
              }
            />
            Aktif
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              checked={values.productionApproved ?? false}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  productionApproved: event.target.checked,
                }))
              }
            />
            Production approved
          </label>
          <label className='space-y-1 text-sm'>
            <span>Display order</span>
            <input
              className='h-9 w-full rounded-md border border-input bg-transparent px-3'
              type='number'
              min='0'
              max='10000'
              value={values.displayOrder ?? ''}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  displayOrder: Number(event.target.value),
                }))
              }
            />
          </label>
        </form>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={pending}
          >
            Batal
          </Button>
          <Button
            type='submit'
            form='payment-method-edit-form'
            disabled={pending}
          >
            {pending ? 'Menyimpan...' : 'Simpan perubahan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
