import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw, Trash2, UsersRound } from 'lucide-react'
import { toast } from 'sonner'
import { ApiRequestError } from '@/api/types'
import { useAuthStore } from '@/stores/auth-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
} from '@/components/feedback'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { adminAccessApi } from '@/features/admin-users/api'
import { contactDirectoryApi, contactDirectoryQueryKey } from './api'
import { contactDirectorySchema } from './schemas'
import {
  CONTACT_CATEGORIES,
  type ContactCategory,
  type ContactDirectoryInput,
  type ContactDirectoryItem,
} from './types'

const categoryLabels: Record<ContactCategory, string> = {
  humas_asrama: 'Humas Asrama',
  layanan_umum_pesantren: 'Layanan Umum Pesantren',
}

const emptyContact: ContactDirectoryInput = {
  category: 'humas_asrama',
  name: '',
  whatsappNumber: '',
  description: '',
  displayOrder: 0,
  active: true,
}
const EMPTY_CONTACTS: ContactDirectoryItem[] = []

function getInput(item: ContactDirectoryItem): ContactDirectoryInput {
  return {
    category: item.category,
    name: item.name,
    ...(item.description === undefined
      ? {}
      : { description: item.description }),
    whatsappNumber: item.whatsappNumber,
    displayOrder: item.displayOrder,
    active: item.active,
  }
}

function compareContacts(a: ContactDirectoryItem, b: ContactDirectoryItem) {
  return a.displayOrder - b.displayOrder || a.name.localeCompare(b.name)
}

export function ContactDirectoryPage() {
  const userId = useAuthStore((state) => state.auth.user?.id)
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingItem, setDeletingItem] = useState<ContactDirectoryItem | null>(
    null
  )
  const accessQuery = useQuery({
    queryKey: ['admin-access', userId],
    queryFn: () => adminAccessApi.access(userId!),
    enabled: !!userId,
  })
  const permissions = accessQuery.data?.data.permissions ?? []
  const canRead = permissions.some(
    (permission) => permission.code === 'contact_directory.read'
  )
  const canManage = permissions.some(
    (permission) => permission.code === 'contact_directory.manage'
  )
  const listQuery = useQuery({
    queryKey: contactDirectoryQueryKey,
    queryFn: contactDirectoryApi.list,
    enabled: canRead,
  })
  const detailQuery = useQuery({
    queryKey: [...contactDirectoryQueryKey, editingId],
    queryFn: () => contactDirectoryApi.get(editingId!),
    enabled: !!editingId,
  })
  const saveMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string | null
      input: ContactDirectoryInput
    }) =>
      id
        ? contactDirectoryApi.update(id, input)
        : contactDirectoryApi.create(input),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: contactDirectoryQueryKey,
      })
      if (variables.id) {
        await queryClient.invalidateQueries({
          queryKey: [...contactDirectoryQueryKey, variables.id],
        })
      }
      setCreateOpen(false)
      setEditingId(null)
      toast.success(
        variables.id
          ? 'Kontak berhasil diperbarui.'
          : 'Kontak berhasil ditambahkan.'
      )
    },
  })
  const deleteMutation = useMutation({
    mutationFn: contactDirectoryApi.delete,
    onSuccess: async (_result, id) => {
      await queryClient.invalidateQueries({
        queryKey: contactDirectoryQueryKey,
      })
      queryClient.removeQueries({
        queryKey: [...contactDirectoryQueryKey, id],
      })
      setDeletingItem(null)
      toast.success('Kontak berhasil dihapus.')
    },
  })
  const activeMutation = useMutation({
    mutationFn: ({
      item,
      active,
    }: {
      item: ContactDirectoryItem
      active: boolean
    }) => contactDirectoryApi.update(item.id, { ...getInput(item), active }),
    onSuccess: async (_result, { active }) => {
      await queryClient.invalidateQueries({
        queryKey: contactDirectoryQueryKey,
      })
      toast.success(active ? 'Kontak diaktifkan.' : 'Kontak dinonaktifkan.')
    },
  })
  const contacts = listQuery.data?.data ?? EMPTY_CONTACTS
  const groupedContacts = useMemo(
    () =>
      Object.fromEntries(
        CONTACT_CATEGORIES.map((category) => [
          category,
          contacts
            .filter((contact) => contact.category === category)
            .sort(compareContacts),
        ])
      ) as Record<ContactCategory, ContactDirectoryItem[]>,
    [contacts]
  )

  if (!userId) {
    return (
      <DirectoryLayout>
        <ForbiddenState />
      </DirectoryLayout>
    )
  }
  if (accessQuery.isPending) {
    return (
      <DirectoryLayout>
        <LoadingState description='Memeriksa hak akses...' />
      </DirectoryLayout>
    )
  }
  if (
    (accessQuery.error instanceof ApiRequestError &&
      accessQuery.error.status === 403) ||
    (!canRead && accessQuery.data)
  ) {
    return (
      <DirectoryLayout>
        <ForbiddenState />
      </DirectoryLayout>
    )
  }
  if (accessQuery.isError) {
    return (
      <DirectoryLayout>
        <ErrorState error={accessQuery.error} onRetry={accessQuery.refetch} />
      </DirectoryLayout>
    )
  }

  return (
    <DirectoryLayout>
      <PageHeader
        eyebrow='Kontak layanan'
        title='Direktori Kontak'
        description='Kelola nomor WhatsApp humas asrama dan layanan umum pesantren.'
        actions={
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='icon'
              aria-label='Muat ulang daftar kontak'
              onClick={() => void listQuery.refetch()}
              disabled={listQuery.isFetching}
            >
              <RefreshCw
                className={listQuery.isFetching ? 'animate-spin' : ''}
              />
            </Button>
            {canManage ? (
              <Button
                onClick={() => {
                  saveMutation.reset()
                  setCreateOpen(true)
                }}
              >
                <Plus /> Tambah kontak
              </Button>
            ) : null}
          </div>
        }
      />

      {listQuery.isPending ? (
        <div className='grid gap-5 xl:grid-cols-2'>
          <Skeleton className='h-64' />
          <Skeleton className='h-64' />
        </div>
      ) : listQuery.error instanceof ApiRequestError &&
        listQuery.error.status === 403 ? (
        <ForbiddenState />
      ) : listQuery.isError ? (
        <ErrorState error={listQuery.error} onRetry={listQuery.refetch} />
      ) : contacts.length === 0 ? (
        <EmptyState
          title='Belum ada kontak layanan'
          description={
            canManage
              ? 'Tambahkan kontak pertama untuk mengelola layanan WhatsApp.'
              : 'Kontak layanan belum tersedia.'
          }
        />
      ) : (
        <div className='grid items-start gap-5 xl:grid-cols-2'>
          {CONTACT_CATEGORIES.map((category) => (
            <ContactGroup
              key={category}
              category={category}
              contacts={groupedContacts[category]}
              canManage={canManage}
              activePending={activeMutation.isPending}
              onEdit={(id) => {
                saveMutation.reset()
                setEditingId(id)
              }}
              onDelete={setDeletingItem}
              onActiveChange={(item, active) =>
                activeMutation.mutate({ item, active })
              }
            />
          ))}
        </div>
      )}

      <Dialog
        open={createOpen || !!editingId}
        onOpenChange={(open) => {
          if (!open && !saveMutation.isPending) {
            setCreateOpen(false)
            setEditingId(null)
            saveMutation.reset()
          }
        }}
      >
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
          {createOpen ? (
            <ContactEditor
              key='new-contact'
              initial={emptyContact}
              saving={saveMutation.isPending}
              error={saveMutation.error?.message}
              onSubmit={(input) => saveMutation.mutate({ id: null, input })}
            />
          ) : detailQuery.isPending ? (
            <>
              <DialogHeader>
                <DialogTitle>Memuat detail kontak</DialogTitle>
                <DialogDescription>
                  Mengambil data terbaru kontak dari server.
                </DialogDescription>
              </DialogHeader>
              <Skeleton className='h-64 w-full' />
            </>
          ) : detailQuery.isError ? (
            <>
              <DialogHeader>
                <DialogTitle>Detail kontak tidak tersedia</DialogTitle>
                <DialogDescription>
                  {detailQuery.error instanceof ApiRequestError &&
                  detailQuery.error.status === 404
                    ? 'Kontak sudah tidak ditemukan.'
                    : detailQuery.error.message}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant='outline' onClick={() => setEditingId(null)}>
                  Tutup
                </Button>
              </DialogFooter>
            </>
          ) : detailQuery.data ? (
            <ContactEditor
              key={detailQuery.data.data.id}
              initial={getInput(detailQuery.data.data)}
              saving={saveMutation.isPending}
              error={saveMutation.error?.message}
              onSubmit={(input) =>
                saveMutation.mutate({ id: detailQuery.data!.data.id, input })
              }
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeletingItem(null)
        }}
        title='Hapus kontak layanan?'
        desc={
          deletingItem
            ? `“${deletingItem.name}” akan dihapus dari direktori. Tindakan ini memakai soft delete.`
            : 'Kontak akan dihapus dari direktori.'
        }
        destructive
        confirmText='Hapus kontak'
        isLoading={deleteMutation.isPending}
        handleConfirm={() => {
          if (deletingItem) deleteMutation.mutate(deletingItem.id)
        }}
      />
    </DirectoryLayout>
  )
}

function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main>{children}</Main>
    </>
  )
}

function ContactGroup({
  category,
  contacts,
  canManage,
  activePending,
  onEdit,
  onDelete,
  onActiveChange,
}: {
  category: ContactCategory
  contacts: ContactDirectoryItem[]
  canManage: boolean
  activePending: boolean
  onEdit: (id: string) => void
  onDelete: (item: ContactDirectoryItem) => void
  onActiveChange: (item: ContactDirectoryItem, active: boolean) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between gap-2'>
          <span className='flex items-center gap-2'>
            <UsersRound className='size-5 text-primary' aria-hidden='true' />
            {categoryLabels[category]}
          </span>
          <Badge variant='secondary'>{contacts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <p className='py-8 text-center text-sm text-muted-foreground'>
            Belum ada kontak dalam kategori ini.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama layanan</TableHead>
                {category === 'layanan_umum_pesantren' ? (
                  <TableHead>Deskripsi</TableHead>
                ) : null}
                <TableHead>WhatsApp</TableHead>
                <TableHead>Urutan</TableHead>
                <TableHead>Status</TableHead>
                {canManage ? (
                  <TableHead className='text-end'>Aksi</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className='max-w-44 font-medium whitespace-normal'>
                    {contact.name}
                  </TableCell>
                  {category === 'layanan_umum_pesantren' ? (
                    <TableCell className='max-w-64 whitespace-normal'>
                      {contact.description || '—'}
                    </TableCell>
                  ) : null}
                  <TableCell>{contact.whatsappNumber}</TableCell>
                  <TableCell>{contact.displayOrder}</TableCell>
                  <TableCell>
                    {canManage ? (
                      <Switch
                        checked={contact.active}
                        disabled={activePending}
                        aria-label={`${contact.active ? 'Nonaktifkan' : 'Aktifkan'} ${contact.name}`}
                        onCheckedChange={(active) =>
                          onActiveChange(contact, active)
                        }
                      />
                    ) : (
                      <Badge variant={contact.active ? 'default' : 'outline'}>
                        {contact.active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    )}
                  </TableCell>
                  {canManage ? (
                    <TableCell>
                      <div className='flex justify-end gap-1'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => onEdit(contact.id)}
                        >
                          Ubah
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          aria-label={`Hapus ${contact.name}`}
                          onClick={() => onDelete(contact)}
                        >
                          <Trash2 className='size-4 text-destructive' />
                        </Button>
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function ContactEditor({
  initial,
  saving,
  error,
  onSubmit,
}: {
  initial: ContactDirectoryInput
  saving: boolean
  error?: string
  onSubmit: (input: ContactDirectoryInput) => void
}) {
  const [values, setValues] = useState(initial)
  const [validationError, setValidationError] = useState('')

  function update<K extends keyof ContactDirectoryInput>(
    key: K,
    value: ContactDirectoryInput[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }))
    setValidationError('')
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = contactDirectorySchema.safeParse(values)
    if (!parsed.success) {
      setValidationError(
        parsed.error.issues[0]?.message ?? 'Periksa kembali data kontak.'
      )
      return
    }
    onSubmit(parsed.data)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {initial.name ? 'Ubah kontak layanan' : 'Tambah kontak layanan'}
        </DialogTitle>
        <DialogDescription>
          Masukkan nama, nomor internasional, kategori, urutan, dan status
          kontak.
        </DialogDescription>
      </DialogHeader>
      <form id='contact-directory-form' className='space-y-4' onSubmit={submit}>
        <div className='space-y-2'>
          <Label htmlFor='contact-category'>Kategori</Label>
          <Select
            value={values.category}
            onValueChange={(category) =>
              update('category', category as ContactCategory)
            }
          >
            <SelectTrigger id='contact-category' aria-label='Kategori kontak'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTACT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {categoryLabels[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='contact-name'>Nama asrama atau layanan</Label>
          <Input
            id='contact-name'
            maxLength={150}
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder='Humas Pusat (Kominfo)'
          />
        </div>
        {values.category === 'layanan_umum_pesantren' ? (
          <div className='space-y-2'>
            <Label htmlFor='contact-description'>Deskripsi layanan</Label>
            <Textarea
              id='contact-description'
              maxLength={1000}
              value={values.description ?? ''}
              onChange={(event) => update('description', event.target.value)}
              placeholder='Jelaskan layanan yang tersedia.'
              aria-describedby='contact-description-hint'
            />
            <p
              id='contact-description-hint'
              className='text-xs text-muted-foreground'
            >
              Wajib untuk layanan umum pesantren, maksimal 1000 karakter.
            </p>
          </div>
        ) : null}
        <div className='space-y-2'>
          <Label htmlFor='contact-whatsapp'>Nomor WhatsApp</Label>
          <Input
            id='contact-whatsapp'
            inputMode='numeric'
            autoComplete='off'
            value={values.whatsappNumber}
            onChange={(event) => update('whatsappNumber', event.target.value)}
            placeholder='6281234567890'
            aria-describedby='contact-whatsapp-hint'
          />
          <p
            id='contact-whatsapp-hint'
            className='text-xs text-muted-foreground'
          >
            8–15 digit, kode negara di depan, tanpa tanda plus atau pemisah.
          </p>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='contact-order'>Urutan tampil</Label>
          <Input
            id='contact-order'
            type='number'
            min={0}
            max={10000}
            step={1}
            value={values.displayOrder}
            onChange={(event) =>
              update('displayOrder', Number(event.target.value))
            }
          />
        </div>
        <div className='flex items-center justify-between rounded-lg border p-3'>
          <div className='space-y-1'>
            <Label htmlFor='contact-active'>Status aktif</Label>
            <p className='text-xs text-muted-foreground'>
              Nonaktifkan sementara tanpa menghapus kontak.
            </p>
          </div>
          <Switch
            id='contact-active'
            checked={values.active}
            onCheckedChange={(active) => update('active', active)}
          />
        </div>
        {validationError || error ? (
          <p role='alert' className='text-sm text-destructive'>
            {validationError || error}
          </p>
        ) : null}
      </form>
      <DialogFooter>
        <Button type='submit' form='contact-directory-form' disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan kontak'}
        </Button>
      </DialogFooter>
    </>
  )
}
