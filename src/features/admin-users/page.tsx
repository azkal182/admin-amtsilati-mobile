import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  Plus,
  Search,
  KeyRound,
  Pencil,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { ApiRequestError } from '@/api/types'
import { handleServerError } from '@/lib/handle-server-error'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  adminAccessApi,
  listAdminUsers,
  createAdminUser,
  updateAdminPassword,
  updateAdminUser,
} from './api'
import { adminPasswordSchema, adminUserSchema } from './schemas'
import type {
  AdminAccess,
  AdminPermission,
  AdminRole,
  AdminUser,
} from './types'

const queryKey = ['admin-users']

export function AdminUsersPage() {
  const search = useSearch({ from: '/_authenticated/admin-users' })
  const navigate = useNavigate({ from: '/admin-users' })
  const queryClient = useQueryClient()
  const [searchText, setSearchText] = useState(search.search)
  const [editor, setEditor] = useState<AdminUser | 'new' | null>(null)
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null)
  const [accessUser, setAccessUser] = useState<AdminUser | null>(null)
  const query = useQuery({
    queryKey: [...queryKey, search],
    queryFn: () => listAdminUsers(search),
  })
  const rolesQuery = useQuery({
    queryKey: ['admin-roles'],
    queryFn: adminAccessApi.roles,
    enabled: !!accessUser,
  })
  const permissionsQuery = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: adminAccessApi.permissions,
    enabled: !!accessUser,
  })
  const accessQuery = useQuery({
    queryKey: ['admin-access', accessUser?.id],
    queryFn: () => adminAccessApi.access(accessUser!.id),
    enabled: !!accessUser,
  })
  const mutationOptions = {
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: handleServerError,
  }
  const createMutation = useMutation({
    mutationFn: createAdminUser,
    ...mutationOptions,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
      toast.success('Administrator berhasil dibuat.')
      setEditor(null)
    },
  })
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number
      input: { username: string; name: string }
    }) => updateAdminUser(id, input),
    ...mutationOptions,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
      toast.success('Profil administrator berhasil diperbarui.')
      setEditor(null)
    },
  })
  const passwordMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      updateAdminPassword(id, password),
    ...mutationOptions,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
      toast.success('Password administrator berhasil diperbarui.')
      setPasswordUser(null)
    },
  })
  const accessMutationOptions = {
    onError: handleServerError,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['admin-access', accessUser?.id],
      }),
  }
  const assignRoleMutation = useMutation({
    mutationFn: ({ id, roleCode }: { id: number; roleCode: string }) =>
      adminAccessApi.assignRole(id, roleCode),
    ...accessMutationOptions,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin-access', accessUser?.id],
      })
      toast.success('Role berhasil ditambahkan.')
    },
  })
  const revokeRoleMutation = useMutation({
    mutationFn: ({ id, roleCode }: { id: number; roleCode: string }) =>
      adminAccessApi.revokeRole(id, roleCode),
    ...accessMutationOptions,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin-access', accessUser?.id],
      })
      toast.success('Role berhasil dicabut.')
    },
  })
  const pagination = query.data?.pagination
  const users = query.data?.data ?? []
  const forbidden =
    query.error instanceof ApiRequestError && query.error.status === 403

  function updateSearch(next: Partial<typeof search>) {
    void navigate({ search: (previous) => ({ ...previous, ...next }) })
  }

  return (
    <>
      <Header>
        <GlobalSearch />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className='mb-6 flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Admin Users</h1>
            <p className='text-muted-foreground'>
              Kelola pengguna administrator Amtsilati.
            </p>
          </div>
          <Button onClick={() => setEditor('new')}>
            <Plus />
            Tambah admin
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between gap-3'>
              <span>Daftar administrator</span>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => void query.refetch()}
                disabled={query.isFetching}
                aria-label='Muat ulang'
              >
                <RefreshCw className={query.isFetching ? 'animate-spin' : ''} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <form
              className='flex max-w-md gap-2'
              onSubmit={(event) => {
                event.preventDefault()
                updateSearch({ search: searchText, page: 1 })
              }}
            >
              <Label htmlFor='admin-user-search' className='sr-only'>
                Cari admin
              </Label>
              <Input
                id='admin-user-search'
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder='Cari username atau nama'
              />
              <Button type='submit' variant='outline' aria-label='Cari'>
                <Search />
              </Button>
            </form>
            {query.isPending ? (
              <div className='space-y-3'>
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
              </div>
            ) : forbidden ? (
              <StateMessage
                title='Akses ditolak'
                message='Anda tidak memiliki permission users.manage.'
              />
            ) : query.isError ? (
              <StateMessage
                title='Gagal memuat admin'
                message={query.error.message}
                action={
                  <Button
                    variant='outline'
                    onClick={() => void query.refetch()}
                  >
                    Coba lagi
                  </Button>
                }
              />
            ) : users.length === 0 ? (
              <StateMessage
                title='Belum ada administrator'
                message={
                  search.search
                    ? 'Tidak ada hasil yang cocok dengan pencarian.'
                    : 'Belum ada data administrator.'
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='text-end'>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className='font-medium'>
                          {user.username}
                        </TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isActive ? 'default' : 'secondary'}
                          >
                            {user.isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex justify-end gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setEditor(user)}
                            >
                              <Pencil />
                              Edit
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setPasswordUser(user)}
                            >
                              <KeyRound />
                              Password
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setAccessUser(user)}
                            >
                              <ShieldCheck />
                              Akses
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className='flex items-center justify-between border-t pt-4 text-sm text-muted-foreground'>
                  <span>
                    {pagination?.total_records ?? users.length} administrator
                  </span>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={!pagination?.prev_page}
                      onClick={() =>
                        updateSearch({ page: pagination?.prev_page ?? 1 })
                      }
                    >
                      Sebelumnya
                    </Button>
                    <span className='flex items-center px-2'>
                      Halaman {pagination?.current_page ?? search.page} dari{' '}
                      {pagination?.total_pages ?? 1}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={!pagination?.next_page}
                      onClick={() =>
                        updateSearch({
                          page: pagination?.next_page ?? search.page,
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
      </Main>
      <AdminUserDialog
        key={editor === 'new' ? 'new' : (editor?.id ?? 'closed')}
        value={editor}
        pending={createMutation.isPending || updateMutation.isPending}
        onClose={() => setEditor(null)}
        onSubmit={(input) => {
          if (editor === 'new')
            createMutation.mutate({
              username: input.username,
              name: input.name,
              password: input.password ?? '',
            })
          else if (editor)
            updateMutation.mutate({
              id: editor.id,
              input: { username: input.username, name: input.name },
            })
        }}
      />
      <PasswordDialog
        user={passwordUser}
        pending={passwordMutation.isPending}
        onClose={() => setPasswordUser(null)}
        onSubmit={(password) => {
          if (passwordUser)
            passwordMutation.mutate({ id: passwordUser.id, password })
        }}
      />
      <AccessDialog
        user={accessUser}
        roles={(rolesQuery.data?.data ?? []) as AdminRole[]}
        permissions={(permissionsQuery.data?.data ?? []) as AdminPermission[]}
        access={
          (accessQuery.data?.data ?? {
            roles: [],
            permissions: [],
          }) as AdminAccess
        }
        loading={
          rolesQuery.isPending ||
          permissionsQuery.isPending ||
          accessQuery.isPending
        }
        pending={assignRoleMutation.isPending || revokeRoleMutation.isPending}
        onClose={() => setAccessUser(null)}
        onAssign={(roleCode) => {
          if (accessUser)
            assignRoleMutation.mutate({ id: accessUser.id, roleCode })
        }}
        onRevoke={(roleCode) => {
          if (accessUser)
            revokeRoleMutation.mutate({ id: accessUser.id, roleCode })
        }}
      />
    </>
  )
}

function StateMessage({
  title,
  message,
  action,
}: {
  title: string
  message: string
  action?: React.ReactNode
}) {
  return (
    <div className='rounded-lg border border-dashed p-8 text-center'>
      <p className='font-medium'>{title}</p>
      <p className='mt-1 text-sm text-muted-foreground'>{message}</p>
      {action && <div className='mt-4'>{action}</div>}
    </div>
  )
}

function AdminUserDialog({
  value,
  pending,
  onClose,
  onSubmit,
}: {
  value: AdminUser | 'new' | null
  pending: boolean
  onClose: () => void
  onSubmit: (input: {
    username: string
    name: string
    password?: string
  }) => void
}) {
  const isNew = value === 'new'
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const open = value !== null
  function reset(next: boolean) {
    if (next) {
      setUsername(value === 'new' ? '' : (value?.username ?? ''))
      setName(value === 'new' ? '' : (value?.name ?? ''))
      setPassword('')
      setError('')
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
        else reset(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isNew ? 'Tambah admin' : 'Edit admin'}</DialogTitle>
          <DialogDescription>
            {isNew
              ? 'Buat akun administrator baru.'
              : 'Perbarui profil administrator.'}
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='admin-username'>Username</Label>
            <Input
              id='admin-username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='admin-name'>Nama</Label>
            <Input
              id='admin-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {isNew && (
            <div className='grid gap-2'>
              <Label htmlFor='admin-password'>Password</Label>
              <Input
                id='admin-password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
          {error && (
            <p role='alert' className='text-sm text-destructive'>
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Batal
          </Button>
          <Button
            disabled={pending}
            onClick={() => {
              const result = adminUserSchema.safeParse({
                username,
                name,
                ...(isNew ? { password } : {}),
              })
              if (!result.success) {
                setError(result.error.issues[0]?.message ?? 'Form tidak valid.')
                return
              }
              onSubmit(result.data)
            }}
          >
            {pending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PasswordDialog({
  user,
  pending,
  onClose,
  onSubmit,
}: {
  user: AdminUser | null
  pending: boolean
  onClose: () => void
  onSubmit: (password: string) => void
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  return (
    <Dialog
      open={!!user}
      onOpenChange={(open) => {
        if (!open) {
          setPassword('')
          setError('')
          onClose()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Perbarui password</DialogTitle>
          <DialogDescription>
            Password baru untuk {user?.username}. Password tidak pernah
            ditampilkan kembali.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-2'>
          <Label htmlFor='new-admin-password'>Password baru</Label>
          <Input
            id='new-admin-password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p role='alert' className='text-sm text-destructive'>
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Batal
          </Button>
          <Button
            disabled={pending}
            onClick={() => {
              const result = adminPasswordSchema.safeParse({ password })
              if (!result.success) {
                setError(result.error.issues[0]?.message ?? 'Form tidak valid.')
                return
              }
              onSubmit(result.data.password)
            }}
          >
            {pending ? 'Menyimpan...' : 'Simpan password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AccessDialog({
  user,
  roles,
  permissions,
  access,
  loading,
  pending,
  onClose,
  onAssign,
  onRevoke,
}: {
  user: AdminUser | null
  roles: AdminRole[]
  permissions: AdminPermission[]
  access: AdminAccess
  loading: boolean
  pending: boolean
  onClose: () => void
  onAssign: (roleCode: string) => void
  onRevoke: (roleCode: string) => void
}) {
  const [roleCode, setRoleCode] = useState('')
  const assigned = new Set(access.roles.map((role) => role.code))
  const available = roles.filter((role) => !assigned.has(role.code))
  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Access management</DialogTitle>
          <DialogDescription>
            Role dan permission efektif untuk {user?.username}. Perubahan
            berlaku pada request berikutnya.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className='space-y-3'>
            <Skeleton className='h-8 w-full' />
            <Skeleton className='h-20 w-full' />
          </div>
        ) : (
          <div className='space-y-5'>
            <section
              className='space-y-2'
              aria-labelledby='assigned-roles-title'
            >
              <h3 id='assigned-roles-title' className='font-medium'>
                Role assigned
              </h3>
              {access.roles.length === 0 ? (
                <p className='text-sm text-muted-foreground'>Belum ada role.</p>
              ) : (
                <div className='flex flex-wrap gap-2'>
                  {access.roles.map((role) => (
                    <Badge
                      key={role.code}
                      variant='secondary'
                      className='gap-1'
                    >
                      {role.name}
                      <button
                        type='button'
                        className='rounded-sm focus-visible:ring-2 focus-visible:outline-none'
                        aria-label={`Cabut role ${role.name}`}
                        disabled={pending}
                        onClick={() => onRevoke(role.code)}
                      >
                        <X className='size-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </section>
            <div className='flex flex-wrap gap-2'>
              <Label htmlFor='assign-role' className='sr-only'>
                Pilih role
              </Label>
              <select
                id='assign-role'
                className='h-9 min-w-56 rounded-md border bg-background px-3 text-sm'
                value={roleCode}
                onChange={(event) => setRoleCode(event.target.value)}
              >
                <option value=''>Pilih role untuk ditambahkan...</option>
                {available.map((role) => (
                  <option key={role.code} value={role.code}>
                    {role.name} ({role.code})
                  </option>
                ))}
              </select>
              <Button
                disabled={!roleCode || pending}
                onClick={() => {
                  onAssign(roleCode)
                  setRoleCode('')
                }}
              >
                Tambah role
              </Button>
            </div>
            <section
              className='space-y-2'
              aria-labelledby='effective-permissions-title'
            >
              <h3 id='effective-permissions-title' className='font-medium'>
                Permission efektif
              </h3>
              {access.permissions.length === 0 ? (
                <p className='text-sm text-muted-foreground'>
                  Belum ada permission efektif.
                </p>
              ) : (
                <ul className='grid gap-2 sm:grid-cols-2'>
                  {access.permissions.map((permission) => (
                    <li key={permission.code} className='rounded-md border p-2'>
                      <p className='text-sm font-medium'>{permission.code}</p>
                      <p className='text-xs text-muted-foreground'>
                        {permission.description}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            {roles.length === 0 && permissions.length === 0 && (
              <p className='text-sm text-destructive'>
                Katalog access tidak tersedia.
              </p>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
