import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Plus, RefreshCw, Search } from 'lucide-react'
import { ApiRequestError } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { listStoreProducts } from './api'

export function StoreProductsPage() {
  const search = useSearch({ from: '/_authenticated/store/products/' })
  const navigate = useNavigate({ from: '/store/products/' })
  const [searchText, setSearchText] = useState(search.search)
  const query = useQuery({
    queryKey: ['store-products', search],
    queryFn: () => listStoreProducts(search),
  })
  const products = query.data?.data ?? []
  const pagination = query.data?.pagination
  const forbidden =
    query.error instanceof ApiRequestError && query.error.status === 403
  const updateSearch = (next: Partial<typeof search>) =>
    void navigate({ search: (previous) => ({ ...previous, ...next }) })
  return (
    <>
      <Header>
        <GlobalSearch />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className='mb-6 flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              Store Products
            </h1>
            <p className='text-muted-foreground'>
              Kelola katalog produk Amtsilati.
            </p>
          </div>
          <Button asChild>
            <Link to='/store/products/new'>
              <Plus />
              Tambah produk
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>Daftar produk</span>
              <Button
                variant='ghost'
                size='icon'
                aria-label='Muat ulang'
                onClick={() => void query.refetch()}
                disabled={query.isFetching}
              >
                <RefreshCw className={query.isFetching ? 'animate-spin' : ''} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <form
              className='flex flex-wrap gap-2'
              onSubmit={(event) => {
                event.preventDefault()
                updateSearch({ search: searchText, page: 1 })
              }}
            >
              <Label htmlFor='store-search' className='sr-only'>
                Cari produk
              </Label>
              <Input
                id='store-search'
                className='max-w-sm'
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder='Cari nama atau deskripsi'
              />
              <Select
                value={search.available}
                onValueChange={(value) =>
                  updateSearch({
                    available: value as typeof search.available,
                    page: 1,
                  })
                }
              >
                <SelectTrigger
                  aria-label='Filter ketersediaan'
                  className='w-44'
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Semua status</SelectItem>
                  <SelectItem value='true'>Tersedia</SelectItem>
                  <SelectItem value='false'>Tidak tersedia</SelectItem>
                </SelectContent>
              </Select>
              <Button type='submit' variant='outline' aria-label='Cari'>
                <Search />
              </Button>
            </form>
            {query.isPending ? (
              <div className='space-y-3'>
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
              </div>
            ) : forbidden ? (
              <State
                title='Akses ditolak'
                message='Anda tidak memiliki permission store.manage.'
              />
            ) : query.isError ? (
              <State
                title='Gagal memuat produk'
                message={query.error.message}
                action={
                  <Button
                    variant='outline'
                    onClick={() => void query.refetch()}
                  >
                    Coba lagi
                  </Button>
                }
              />
            ) : products.length === 0 ? (
              <State
                title='Belum ada produk'
                message={
                  search.search || search.available !== 'all'
                    ? 'Tidak ada produk yang cocok dengan filter.'
                    : 'Katalog produk masih kosong.'
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Max beli</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='text-end'>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className='font-medium'>{product.name}</div>
                          <div className='max-w-md truncate text-xs text-muted-foreground'>
                            {product.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          Rp {product.price.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>{product.maxBuy}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.available ? 'default' : 'secondary'
                            }
                          >
                            {product.available ? 'Tersedia' : 'Tidak tersedia'}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-end'>
                          <Button asChild variant='outline' size='sm'>
                            <Link
                              to='/store/products/$id'
                              params={{ id: String(product.id) }}
                            >
                              Detail
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className='flex items-center justify-between border-t pt-4 text-sm text-muted-foreground'>
                  <span>
                    {pagination?.total_records ?? products.length} produk
                  </span>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={!pagination?.prev_page}
                      onClick={() =>
                        updateSearch({ page: pagination?.prev_page ?? 1 })
                      }
                    >
                      Sebelumnya
                    </Button>
                    <span>
                      Halaman {pagination?.current_page ?? search.page} dari{' '}
                      {pagination?.total_pages ?? 1}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={!pagination?.next_page}
                      onClick={() =>
                        updateSearch({
                          page: pagination?.next_page ?? search.page,
                        })
                      }
                    >
                      Berikutnya
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
function State({
  title,
  message,
  action,
}: {
  title: string
  message: string
  action?: React.ReactNode
}) {
  return (
    <div className='rounded-lg border border-dashed p-8 text-center'>
      <p className='font-medium'>{title}</p>
      <p className='mt-1 text-sm text-muted-foreground'>{message}</p>
      {action && <div className='mt-4'>{action}</div>}
    </div>
  )
}
