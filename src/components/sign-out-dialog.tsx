import { useState } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { signOutAdmin } from '@/features/auth/auth-session'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const [isPending, setIsPending] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const handleSignOut = async () => {
    setIsPending(true)
    try {
      await signOutAdmin()
      // Preserve current location for redirect after sign-in
      const currentPath = location.href
      await navigate({
        to: '/sign-in',
        search: { redirect: currentPath },
        replace: true,
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      destructive
      isLoading={isPending}
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
