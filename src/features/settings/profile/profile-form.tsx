import { useQuery } from '@tanstack/react-query'
import { ShieldCheck, UserRound } from 'lucide-react'
import { ApiRequestError } from '@/api/types'
import { useAuthStore } from '@/stores/auth-store'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ErrorState, ForbiddenState, LoadingState } from '@/components/feedback'
import { getAdminProfileAccess, getCurrentAdminProfile } from './api'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
      <dt className='text-sm text-muted-foreground'>{label}</dt>
      <dd className='font-medium'>{value}</dd>
    </div>
  )
}

export function ProfileForm() {
  const sessionUser = useAuthStore((state) => state.auth.user)
  const profileQuery = useQuery({
    queryKey: ['admin-profile'],
    queryFn: getCurrentAdminProfile,
  })
  const profile = profileQuery.data?.data ?? sessionUser
  const accessQuery = useQuery({
    queryKey: ['admin-profile-access', profile?.id],
    queryFn: () => getAdminProfileAccess(profile!.id),
    enabled: profile?.id !== undefined,
  })
  const forbidden =
    profileQuery.error instanceof ApiRequestError &&
    profileQuery.error.status === 403
  const accessForbidden =
    accessQuery.error instanceof ApiRequestError &&
    accessQuery.error.status === 403

  if (profileQuery.isPending)
    return <LoadingState description='Memuat sesi admin...' />
  if (forbidden) return <ForbiddenState />
  if (profileQuery.isError || !profile) {
    return (
      <ErrorState error={profileQuery.error} onRetry={profileQuery.refetch} />
    )
  }

  const isActive = 'isActive' in profile ? profile.isActive : true
  const access = accessQuery.data?.data

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <UserRound className='size-5' aria-hidden='true' />
            Sesi administrator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className='space-y-4'>
            <InfoRow label='Nama' value={profile.name} />
            <InfoRow label='Username' value={profile.username} />
            <InfoRow label='ID administrator' value={String(profile.id)} />
            <InfoRow
              label='Status akun'
              value={isActive ? 'Aktif' : 'Nonaktif'}
            />
          </dl>
          <Separator className='my-5' />
          <p className='text-sm text-muted-foreground'>
            Data ini diambil dari sesi admin dan endpoint profile backend. Token
            tidak ditampilkan di halaman.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ShieldCheck className='size-5' aria-hidden='true' />
            Hak akses efektif
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {accessQuery.isPending ? (
            <LoadingState description='Memuat role dan permission...' />
          ) : accessForbidden ? (
            <ForbiddenState />
          ) : accessQuery.isError ? (
            <ErrorState
              error={accessQuery.error}
              onRetry={accessQuery.refetch}
            />
          ) : (
            <>
              <section
                aria-labelledby='profile-roles-title'
                className='space-y-3'
              >
                <h3 id='profile-roles-title' className='font-medium'>
                  Role
                </h3>
                {access?.roles.length ? (
                  <div className='flex flex-wrap gap-2'>
                    {access.roles.map((role) => (
                      <Badge
                        key={role.id}
                        variant='secondary'
                        title={role.description}
                      >
                        {role.name || role.code}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    Belum ada role efektif.
                  </p>
                )}
              </section>
              <section
                aria-labelledby='profile-permissions-title'
                className='space-y-3'
              >
                <h3 id='profile-permissions-title' className='font-medium'>
                  Permission
                </h3>
                {access?.permissions.length ? (
                  <div className='flex flex-wrap gap-2'>
                    {access.permissions.map((permission) => (
                      <Badge
                        key={permission.id}
                        variant='outline'
                        title={permission.description}
                      >
                        {permission.code}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    Belum ada permission efektif.
                  </p>
                )}
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
