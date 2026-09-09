import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  return (
    <AuthLayout>
      <Card className='gap-0 border-border/70 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur-sm'>
        <CardHeader className='gap-3 pb-6'>
          <Badge variant='secondary' className='w-fit'>
            Akses administrator
          </Badge>
          <CardTitle className='text-2xl tracking-tight'>
            Masuk ke Amtsilati
          </CardTitle>
          <CardDescription>
            Gunakan akun admin Anda untuk melanjutkan ke panel operasional.
          </CardDescription>
        </CardHeader>
        <CardContent className='pb-6'>
          <UserAuthForm />
        </CardContent>
        <CardFooter className='border-t bg-muted/20 px-6 py-4'>
          <p className='text-center text-xs leading-5 text-muted-foreground'>
            Halaman ini khusus untuk administrator Amtsilati. Jangan bagikan
            kredensial Anda.
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
