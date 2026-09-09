import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import {
  ensureAdminSession,
  getSafeRedirect,
} from '@/features/auth/auth-session'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
  beforeLoad: async ({ location }) => {
    if (!(await ensureAdminSession())) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: getSafeRedirect(location.href) },
      })
    }
  },
})
