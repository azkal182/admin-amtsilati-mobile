# Schema, Envelope, dan Flow API

## 1. Envelope success

```json
{
  "success": true,
  "message": "Admin users retrieved",
  "data": [],
  "pagination": {
    "total_records": 0,
    "current_page": 1,
    "total_pages": 0,
    "next_page": null,
    "prev_page": null
  },
  "meta": {
    "timestamp": "2026-01-01T00:00:00Z",
    "requestId": "request-id"
  }
}
```

Response non-pagination tidak memiliki `pagination`. Jangan menganggap `data` selalu object; data bisa array, object, atau null sesuai schema endpoint.

## 2. Envelope error

```json
{
  "success": false,
  "message": "Insufficient permissions",
  "error": {
    "code": "FORBIDDEN",
    "details": null
  },
  "meta": {
    "timestamp": "2026-01-01T00:00:00Z",
    "requestId": "request-id"
  }
}
```

Untuk validasi, `error.details` dapat berupa array field error. Selalu simpan `meta.requestId` pada error log frontend/support ticket.

## 3. Schema inti

### Admin user

```ts
type AdminUser = {
  id: number;
  username: string;
  name: string;
  isActive: boolean;
};
```

### Student snapshot

```ts
type Student = {
  idSantri: string;
  nis: string;
  nama: string;
  alamat: string;
  status: string;
};
```

### Store product

```ts
type StoreProduct = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  maxBuy: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### Tariff dan periode

```ts
type Tariff = {
  hijriPeriod: string; // YYYY-MM, contoh 1447-01
  category: string;
  amount: number;
  createdBy?: string;
};
```

Nominal integer adalah IDR unit terkecil yang dikirim API. Format tampilan dilakukan frontend.

## 4. Flow store upload

1. Minta `POST /internal/admin/store/uploads/sign`.
2. Terima `uploadUrl`, `cloudName`, `apiKey`, `timestamp`, `signature`, `folder`, `expiresAt`.
3. Upload file langsung ke `uploadUrl` dengan parameter Cloudinary yang sesuai.
4. Validasi response upload dan ambil secure URL.
5. Kirim URL tersebut pada `imageUrl` create/update product.
6. Jika 429, gunakan exponential backoff dan batasi retry.

Jangan mengirim `apiSecret` atau membuat signature di frontend.

## 5. Flow async student sync

1. POST trigger sync.
2. Jika 200, tampilkan status `started`.
3. Poll status endpoint dengan interval, misalnya 2–5 detik, dan timeout UI yang wajar.
4. Tampilkan status `running`, `success`, atau `failed` jika tersedia.
5. Jangan memulai banyak trigger paralel; backend mengembalikan 409 saat sync sedang berjalan.

## 6. Flow mutasi dengan audit

Untuk create/update/patch/release/assign:

1. Validasi form di client.
2. Kirim request dengan admin access token.
3. Tampilkan loading dan disable tombol submit.
4. Pada sukses, refresh query/list terkait.
5. Pada 401, jalankan refresh flow.
6. Pada 403, tampilkan forbidden.
7. Pada 409/400, tampilkan error dekat field/form.
8. Simpan request ID untuk troubleshooting. Audit log dibuat backend; frontend tidak perlu mengirim snapshot password atau token.

## 7. User role management flow

1. Ambil katalog role dan permission dari `/internal/admin/roles` dan `/internal/admin/permissions`.
2. Ambil akses efektif user dari `/internal/admin/users/{id}/access`.
3. Saat admin menambahkan role, kirim `POST /internal/admin/users/{id}/roles` dengan `roleCode`.
4. Saat admin menghapus role, kirim `DELETE /internal/admin/users/{id}/roles/{roleCode}`.
5. Refresh access profile setelah mutasi. Backend menghitung permission efektif dari seluruh role user.
6. Tangani `403` untuk operator tanpa `users.manage` dan `404` untuk role atau assignment yang tidak ditemukan.

## 8. Calendar event flow

Admin menggunakan `/internal/admin/events` untuk membuat dan mengelola event. `GET /internal/admin/events/{id}` mengambil detail berdasarkan UUID. `PATCH` bersifat partial: field yang tidak dikirim dipertahankan. `DELETE` tidak menghapus fisik data, tetapi mengubah status menjadi `ARCHIVED`. Field `status` dapat berupa `DRAFT`, `PUBLISHED`, atau `ARCHIVED`; hanya `PUBLISHED` yang dikirim endpoint `/calendar/events`. Status `PUBLISHED` membutuhkan permission `events.publish`.

`scope` saat ini hanya `NATIONAL` dan `PESANTREN`. `id` event adalah UUID dan `code` harus unik.

`dateRule` mengikuti kalender sumber:

```ts
type CalendarDateRule =
  | { basis: 'GREGORIAN'; recurrence: 'ONCE'; gregorian: { date: string } }
  | { basis: 'GREGORIAN'; recurrence: 'YEARLY'; gregorian: { month: number; day: number }; range?: YearRange }
  | { basis: 'HIJRI'; recurrence: 'ONCE'; hijri: { year: number; month: number; day: number } }
  | { basis: 'HIJRI'; recurrence: 'YEARLY'; hijri: { month: number; day: number }; range?: YearRange };
```

Server tidak mengubah tanggal Hijriah ke Gregorian. Mobile mencocokkan rule dengan `CalendarDay` miliknya sendiri. `category.colorToken` dan `category.icon` adalah semantic token; gunakan fallback lokal bila token belum dikenali.

Untuk mobile, simpan ETag dan kirim kembali sebagai `If-None-Match`. Jika response `304`, gunakan dataset cache sebelumnya.
