import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { adminAccessApi } from '@/features/admin-users/api'

export const PAYMENT_PERMISSIONS = {
  read: 'payments.read',
  manage: 'payments.manage',
  reconcile: 'payments.reconcile',
  retry: 'payments.webhook.retry',
} as const

export function hasPaymentPermission(
  permissions: Iterable<string>,
  permission: string
) {
  return new Set(permissions).has(permission)
}

export function usePaymentPermissions() {
  const userId = useAuthStore((state) => state.auth.user?.id)
  const query = useQuery({
    queryKey: ['admin-access', userId],
    queryFn: () => adminAccessApi.access(userId!),
    enabled: !!userId,
  })
  const permissions =
    query.data?.data.permissions.map((permission) => permission.code) ?? []
  return {
    data: query.data,
    error: query.error,
    isError: query.isError,
    isPending: query.isPending,
    refetch: query.refetch,
    canRead: hasPaymentPermission(permissions, PAYMENT_PERMISSIONS.read),
    canManage: hasPaymentPermission(permissions, PAYMENT_PERMISSIONS.manage),
    canReconcile: hasPaymentPermission(
      permissions,
      PAYMENT_PERMISSIONS.reconcile
    ),
    canRetry: hasPaymentPermission(permissions, PAYMENT_PERMISSIONS.retry),
  }
}
