import { createFileRoute } from '@tanstack/react-router'
import { ContactDirectoryPage } from '@/features/contact-directory'

export const Route = createFileRoute('/_authenticated/contact-directory')({
  component: ContactDirectoryPage,
})
