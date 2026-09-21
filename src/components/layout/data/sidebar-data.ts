import {
  Activity,
  BookOpen,
  CalendarDays,
  CreditCard,
  Bell,
  LayoutDashboard,
  Palette,
  Settings,
  ShoppingBag,
  UserCog,
  Users,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: { name: 'Administrator', email: 'admin@amtsilati.local', avatar: '' },
  teams: [{ name: 'Amtsilati', logo: BookOpen, plan: 'Admin Panel' }],
  navGroups: [
    {
      title: 'Operasional',
      items: [
        { title: 'Dashboard', url: '/', icon: LayoutDashboard },
        { title: 'Admin Users', url: '/admin-users', icon: Users },
        { title: 'Students', url: '/students', icon: BookOpen },
        { title: 'Syahriyah', url: '/syahriyah', icon: Activity },
        { title: 'Store', url: '/store/products', icon: ShoppingBag },
        { title: 'Calendar Events', url: '/events', icon: CalendarDays },
        { title: 'Payments', url: '/payments', icon: CreditCard },
        { title: 'Notification Operations', url: '/notifications', icon: Bell },
      ],
    },
    {
      title: 'Pengaturan',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            { title: 'Profile', url: '/settings', icon: UserCog },
            { title: 'Appearance', url: '/settings/appearance', icon: Palette },
          ],
        },
      ],
    },
  ],
}
