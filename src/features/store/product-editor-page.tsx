import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { ApiRequestError } from '@/api/types'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { storeApi, uploadStoreImage } from './api'
import { storeProductSchema } from './schemas'
import type { StoreProductInput } from './types'

export function StoreProductEditorPage() {
  const params = useParams({ strict: false }) as { id?: string }
  const isNew = !params.id
  const navigate = useNavigate()
  const client = useQueryClient()
  const query = useQuery({
    queryKey: ['store-product', params.id],
    queryFn: () => storeApi.get(Number(params.id)),
    enabled: !isNew,
  })
  if (!isNew && query.isPending)
    return (
      <EditorLayout>
        <Skeleton className='h-96 w-full' />
      </EditorLayout>
    )
  if (!isNew && (query.isError || !query.data?.data))
    return (
      <EditorLayout>
        <State
          title={
            query.error instanceof ApiRequestError && query.error.status === 404
              ? 'Produk tidak ditemukan'
              : 'Gagal memuat produk'
          }
          message={query.error?.message ?? 'Data produk tidak tersedia.'}
        />
      </EditorLayout>
    )
  return (
    <EditorLayout>
      <ProductForm
        key={params.id ?? 'new'}
        initial={query.data?.data}
        isNew={isNew}
        saving={false}
        onSubmit={async (input, file) => {
          let payload = input
          if (file) {
            try {
              const sign = await storeApi.signUpload()
              payload = {
                ...input,
                imageUrl: await uploadStoreImage(sign.data, file),
              }
            } catch (error) {
              throw Object.assign(
                new Error(
                  `Upload gambar gagal: ${error instanceof Error ? error.message : 'silakan coba lagi.'}`
                ),
                { cause: error }
              )
            }
          }
          let result
          try {
            result = isNew
              ? await storeApi.create(payload)
              : await storeApi.update(Number(params.id), payload)
          } catch (error) {
            throw Object.assign(
              new Error(
                `Penyimpanan produk gagal: ${error instanceof Error ? error.message : 'silakan coba lagi.'}`
              ),
              { cause: error }
            )
          }
          void client.invalidateQueries({ queryKey: ['store-products'] })
          toast.success(
            isNew ? 'Produk berhasil dibuat.' : 'Produk berhasil diperbarui.'
          )
          await navigate({
            to: '/store/products/$id',
            params: { id: String(result.data.id) },
          })
        }}
      />
    </EditorLayout>
  )
}

function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header>
        <Search />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main>{children}</Main>
    </>
  )
}
function State({ title, message }: { title: string; message: string }) {
  return (
    <div className='rounded-lg border border-dashed p-8 text-center'>
      <p className='font-medium'>{title}</p>
      <p className='mt-1 text-sm text-muted-foreground'>{message}</p>
    </div>
  )
}
function ProductForm({
  initial,
  isNew,
  saving,
  onSubmit,
}: {
  initial?: {
    name: string
    description: string
    imageUrl: string
    price: number
    maxBuy: number
    available: boolean
  }
  isNew: boolean
  saving: boolean
  onSubmit: (input: StoreProductInput, file?: File) => Promise<void>
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [price, setPrice] = useState(String(initial?.price ?? ''))
  const [maxBuy, setMaxBuy] = useState(String(initial?.maxBuy ?? 1))
  const [available, setAvailable] = useState(initial?.available ?? true)
  const [file, setFile] = useState<File>()
  const [error, setError] = useState('')
  const mutation = useMutation({
    mutationFn: () => {
      const parsed = storeProductSchema.parse({
        name,
        description,
        imageUrl: imageUrl || (file ? 'https://upload.pending' : imageUrl),
        price,
        maxBuy,
        available,
      })
      return onSubmit(parsed, file)
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan produk.')
      handleServerError(err)
    },
  })
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <Button
            asChild
            variant='ghost'
            size='icon'
            aria-label='Kembali ke daftar produk'
          >
            <Link
              to='/store/products'
              search={{ page: 1, limit: 20, search: '', available: 'all' }}
            >
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <CardTitle>{isNew ? 'Tambah produk' : 'Edit produk'}</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Gambar diupload melalui signed Cloudinary upload.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className='grid gap-4'
          onSubmit={(event) => {
            event.preventDefault()
            setError('')
            try {
              mutation.mutate()
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Form tidak valid.')
            }
          }}
        >
          <div className='grid gap-2'>
            <Label htmlFor='product-name'>Nama produk</Label>
            <Input
              id='product-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='product-description'>Deskripsi</Label>
            <Textarea
              id='product-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='product-image'>URL gambar HTTPS</Label>
            <Input
              id='product-image'
              placeholder='https://...'
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='product-file'>Atau upload gambar baru</Label>
            <Input
              id='product-file'
              type='file'
              accept='image/*'
              onChange={(e) => setFile(e.target.files?.[0])}
            />
            <p className='text-xs text-muted-foreground'>
              <Upload className='mr-1 inline size-3' />
              Upload akan mengganti URL gambar setelah signed upload berhasil.
            </p>
          </div>
          <div className='grid gap-4 sm:grid-cols-3'>
            <div className='grid gap-2'>
              <Label htmlFor='product-price'>Harga (IDR)</Label>
              <Input
                id='product-price'
                type='number'
                min='0'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='product-max-buy'>Max beli</Label>
              <Input
                id='product-max-buy'
                type='number'
                min='1'
                value={maxBuy}
                onChange={(e) => setMaxBuy(e.target.value)}
              />
            </div>
            <label className='flex items-center gap-2 self-end'>
              <input
                type='checkbox'
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
              />
              Tersedia
            </label>
          </div>
          {error && (
            <p role='alert' className='text-sm text-destructive'>
              {error}
            </p>
          )}
          <Button disabled={mutation.isPending || saving}>
            {mutation.isPending ? 'Menyimpan...' : 'Simpan produk'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
