import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiRequestError } from '@/api/types'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ErrorState, ForbiddenState, LoadingState } from '@/components/feedback'
import { adminAccessApi } from '@/features/admin-users/api'
import { ContentSection } from '../components/content-section'
import {
  type AdminAppConfig,
  appConfigQueryKey,
  getAdminAppConfig,
  updateAdminAppConfig,
} from './api'

function isValidNumber(value: string) {
  return /^\d*$/.test(value)
}

export function AppConfigSettings() {
  const userId = useAuthStore((state) => state.auth.user?.id)
  const accessQuery = useQuery({
    queryKey: ['admin-access', userId],
    queryFn: () => adminAccessApi.access(userId!),
    enabled: !!userId,
  })
  const canManage = (accessQuery.data?.data.permissions ?? []).some(
    (permission) => permission.code === 'app_config.manage'
  )
  const configQuery = useQuery({
    queryKey: appConfigQueryKey,
    queryFn: getAdminAppConfig,
    enabled: canManage,
  })
  const accessForbidden =
    accessQuery.error instanceof ApiRequestError &&
    accessQuery.error.status === 403
  const configForbidden =
    configQuery.error instanceof ApiRequestError &&
    configQuery.error.status === 403

  if (accessQuery.isPending) {
    return (
      <ContentSection
        title='Kontak WhatsApp'
        desc='Atur nomor kontak yang digunakan oleh aplikasi Amtsilati.'
      >
        <LoadingState description='Memeriksa permission admin...' />
      </ContentSection>
    )
  }
  if (accessForbidden || (accessQuery.data && !canManage) || configForbidden) {
    return (
      <ContentSection
        title='Kontak WhatsApp'
        desc='Atur nomor kontak yang digunakan oleh aplikasi Amtsilati.'
      >
        <ForbiddenState />
      </ContentSection>
    )
  }
  if (accessQuery.isError) {
    return (
      <ContentSection
        title='Kontak WhatsApp'
        desc='Atur nomor kontak yang digunakan oleh aplikasi Amtsilati.'
      >
        <ErrorState error={accessQuery.error} onRetry={accessQuery.refetch} />
      </ContentSection>
    )
  }
  if (!userId || configQuery.isPending) {
    return (
      <ContentSection
        title='Kontak WhatsApp'
        desc='Atur nomor kontak yang digunakan oleh aplikasi Amtsilati.'
      >
        <LoadingState description='Memuat konfigurasi aplikasi...' />
      </ContentSection>
    )
  }
  if (configQuery.isError) {
    return (
      <ContentSection
        title='Kontak WhatsApp'
        desc='Atur nomor kontak yang digunakan oleh aplikasi Amtsilati.'
      >
        <ErrorState error={configQuery.error} onRetry={configQuery.refetch} />
      </ContentSection>
    )
  }

  return <AppConfigForm initial={configQuery.data.data} />
}

function AppConfigForm({ initial }: { initial: AdminAppConfig }) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState(initial)
  const [validationMessage, setValidationMessage] = useState('')
  const saveMutation = useMutation({
    mutationFn: updateAdminAppConfig,
    onSuccess: async (response) => {
      queryClient.setQueryData(appConfigQueryKey, response)
      await queryClient.invalidateQueries({ queryKey: appConfigQueryKey })
      toast.success('Kontak WhatsApp berhasil disimpan.')
    },
  })
  const adminNumberValid = isValidNumber(values.whatsappAdminNumber)
  const storeNumberValid = isValidNumber(values.whatsappStoreNumber)
  const hasInvalidNumber = !adminNumberValid || !storeNumberValid

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (hasInvalidNumber) {
      setValidationMessage(
        'Nomor harus berisi digit saja dengan kode negara, atau dikosongkan.'
      )
      return
    }
    setValidationMessage('')
    saveMutation.mutate({
      whatsappAdminNumber: values.whatsappAdminNumber,
      whatsappStoreNumber: values.whatsappStoreNumber,
    })
  }

  if (
    saveMutation.error instanceof ApiRequestError &&
    saveMutation.error.status === 403
  ) {
    return <ForbiddenState />
  }

  return (
    <ContentSection
      title='Kontak WhatsApp'
      desc='Atur nomor kontak yang ditampilkan dan digunakan oleh aplikasi Amtsilati.'
    >
      <Card>
        <CardHeader>
          <CardTitle>Nomor WhatsApp aplikasi</CardTitle>
          <p className='text-sm text-muted-foreground'>
            Gunakan kode negara tanpa tanda plus atau pemisah. Kosongkan field
            untuk menghapus nomor. Aplikasi mobile menangani pembukaan WhatsApp
            dan pembuatan pesan.
          </p>
        </CardHeader>
        <CardContent>
          <form className='space-y-5' onSubmit={submit} noValidate>
            <div className='space-y-2'>
              <Label htmlFor='whatsapp-admin-number'>WhatsApp Admin</Label>
              <Input
                id='whatsapp-admin-number'
                inputMode='numeric'
                autoComplete='off'
                placeholder='6281234567890'
                value={values.whatsappAdminNumber}
                aria-invalid={!adminNumberValid}
                aria-describedby='whatsapp-admin-help'
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    whatsappAdminNumber: event.target.value,
                  }))
                }
              />
              <p
                id='whatsapp-admin-help'
                className='text-sm text-muted-foreground'
              >
                Untuk masukan atau pertanyaan tentang aplikasi.
              </p>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='whatsapp-store-number'>WhatsApp Store</Label>
              <Input
                id='whatsapp-store-number'
                inputMode='numeric'
                autoComplete='off'
                placeholder='6289876543210'
                value={values.whatsappStoreNumber}
                aria-invalid={!storeNumberValid}
                aria-describedby='whatsapp-store-help'
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    whatsappStoreNumber: event.target.value,
                  }))
                }
              />
              <p
                id='whatsapp-store-help'
                className='text-sm text-muted-foreground'
              >
                Untuk pertanyaan seputar katalog dan store.
              </p>
            </div>
            {validationMessage || saveMutation.isError ? (
              <p role='alert' className='text-sm text-destructive'>
                {validationMessage || saveMutation.error?.message}
              </p>
            ) : null}
            <div className='flex justify-end'>
              <Button type='submit' disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Menyimpan...' : 'Simpan perubahan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ContentSection>
  )
}
