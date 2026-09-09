import { z } from 'zod'

export const storeProductSchema = z.object({
  name: z.string().trim().min(1, 'Nama produk wajib diisi.'),
  description: z.string().trim().min(1, 'Deskripsi produk wajib diisi.'),
  imageUrl: z
    .string()
    .url('URL gambar tidak valid.')
    .refine(
      (value) => value.startsWith('https://'),
      'URL gambar harus menggunakan HTTPS.'
    ),
  price: z.coerce.number().int().nonnegative('Harga tidak boleh negatif.'),
  maxBuy: z.coerce.number().int().min(1, 'Batas pembelian minimal 1.'),
  available: z.boolean(),
})
