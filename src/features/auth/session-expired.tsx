import { Link, useSearch } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from './auth-layout'

export function SessionExpired() {
  const { redirect } = useSearch({ from: '/(auth)/session-expired' })
  return (
    <AuthLayout>
      <Card className='max-w-sm gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            Sesi berakhir
          </CardTitle>
          <CardDescription>
            Sesi admin Anda sudah berakhir. Silakan masuk kembali untuk
            melanjutkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className='w-full'>
            <Link to='/sign-in' search={{ redirect }}>
              Masuk kembali
            </Link>
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
