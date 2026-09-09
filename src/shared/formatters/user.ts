import { getDisplayNameInitials } from '@/lib/utils'

export function getUserInitials(name: string) {
  const initials = getDisplayNameInitials(name)
  return initials === '?' ? 'AD' : initials
}

export function getUserContactLabel(username: string) {
  return `@${username}`
}
