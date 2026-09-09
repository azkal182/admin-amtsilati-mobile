import { fonts } from '@/config/fonts'
import { Moon, Monitor, Sun } from 'lucide-react'
import { useFont } from '@/context/font-provider'
import { useTheme, type Theme } from '@/context/theme-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const themeOptions: {
  value: Theme
  label: string
  description: string
  icon: typeof Sun
}[] = [
  {
    value: 'light',
    label: 'Terang',
    description: 'Gunakan tema terang',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Gelap',
    description: 'Gunakan tema gelap',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'Sistem',
    description: 'Ikuti preferensi perangkat',
    icon: Monitor,
  },
]

export function AppearanceForm() {
  const { font, setFont } = useFont()
  const { theme, setTheme } = useTheme()

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Tema panel</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-3 sm:grid-cols-3'>
          {themeOptions.map(({ value, label, description, icon: Icon }) => (
            <button
              key={value}
              type='button'
              aria-pressed={theme === value}
              onClick={() => setTheme(value)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-start transition-colors focus-visible:ring-2 focus-visible:ring-ring ${theme === value ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
            >
              <Icon className='mt-0.5 size-5 text-primary' aria-hidden='true' />
              <span className='space-y-1'>
                <span className='block font-medium'>{label}</span>
                <span className='block text-xs text-muted-foreground'>
                  {description}
                </span>
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Tipografi</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='space-y-2'>
            <Label htmlFor='appearance-font'>Font utama</Label>
            <Select
              value={font}
              onValueChange={(value) => setFont(value as typeof font)}
            >
              <SelectTrigger id='appearance-font' className='w-full sm:w-64'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((fontOption) => (
                  <SelectItem key={fontOption} value={fontOption}>
                    <span className='capitalize'>{fontOption}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='text-sm text-muted-foreground'>
              Perubahan tersimpan otomatis di perangkat ini.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
