import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { LogIn } from 'lucide-react'
import { ApiRequestError } from '@/api/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { signInAdmin, getSafeRedirect } from '@/features/auth/auth-session'

const formSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi.'),
  password: z.string().min(1, 'Password wajib diisi.'),
})

type UserAuthFormProps = React.HTMLAttributes<HTMLFormElement>

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const navigate = useNavigate()
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', password: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      await signInAdmin(data)
      await navigate({
        to: getSafeRedirect(redirect),
        replace: true,
      })
    } catch (error) {
      const message =
        error instanceof ApiRequestError && [400, 401].includes(error.status)
          ? 'Username atau password admin salah.'
          : 'Login gagal. Silakan coba lagi.'
      form.setError('root', { message })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-5', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder='username admin'
                  autoComplete='username'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder='••••••••'
                  autoComplete='current-password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root?.message && (
          <p className='text-sm text-destructive' role='alert'>
            {form.formState.errors.root.message}
          </p>
        )}
        <Button
          className='mt-1 h-11 w-full'
          disabled={form.formState.isSubmitting}
        >
          <LogIn />
          {form.formState.isSubmitting ? 'Memproses...' : 'Masuk'}
        </Button>
      </form>
    </Form>
  )
}
