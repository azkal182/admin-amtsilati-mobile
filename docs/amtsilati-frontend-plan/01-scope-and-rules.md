# Scope dan Aturan Proyek

## 1. Scope frontend

Frontend ini adalah panel backoffice untuk operator/staff Amtsilati. Modul aktif yang direncanakan:

1. Dashboard operasional.
2. Admin Users.
3. Students read-only snapshot.
4. Syahriyah: student sync, tariff, snapshot, dan pengurus.
5. Store: product management dan signed upload.
6. Calendar Events: list, detail, create, edit, dan archive.
7. Auth, session expired, forbidden, error state, dan settings dasar.

Domain content dan calendar adjustment belum dibuat karena belum memiliki kontrak endpoint aktif.

## 2. API boundary

### Boleh digunakan

- `/api/v1/internal/admin/auth/*`
- `/api/v1/internal/admin/users*`
- `/api/v1/internal/admin/students*`
- `/api/v1/internal/admin/syahriyah/*`
- `/api/v1/internal/admin/store/*`
- `/api/v1/internal/admin/events*`
- `/api/v1/health`

### Tidak boleh digunakan untuk panel admin

- `/api/v1/auth/*` user/client.
- `/api/v1/users*`.
- `/api/v1/accounts/*`.
- `/api/v1/students/*` user-facing.
- `/api/v1/store/products*` public/client.
- Endpoint legacy `/api/v1/internal/syahriyah/*` yang ditandai deprecated.

Frontend tidak boleh menggabungkan admin token dengan user token atau membuat satu client yang memiliki policy auth campuran.

## 3. Aturan authentication dan security

- Login admin menggunakan `POST /internal/admin/auth/login` dengan `username` dan `password`.
- Access token hanya dipakai untuk request admin yang protected.
- Refresh memakai `POST /internal/admin/auth/token/refresh`.
- Satu request gagal 401 hanya boleh menjalankan satu percobaan refresh.
- Jika refresh gagal, session dibersihkan dan user diarahkan ke login.
- Logout tetap membersihkan session lokal walaupun request logout gagal.
- `X-Internal-Token` tidak dikirim frontend karena admin selalu memakai JWT.
- JWT secret, refresh secret, database DSN, Cloudinary API secret, dan internal secret tidak boleh masuk bundle frontend.
- Access token dan refresh token tidak boleh ditulis ke console, telemetry, atau error message.
- Permission pada UI hanya untuk visibility dan UX; backend tetap menjadi security boundary.
- Response 403 tidak boleh dianggap sebagai token expired dan tidak boleh di-retry.

## 4. Aturan API dan data

- Semua response diproses melalui envelope standar.
- `meta.requestId` disimpan saat error untuk troubleshooting.
- Pagination dilakukan server-side.
- Search, filter, dan pagination disimpan di URL jika halaman mendukungnya.
- Tidak boleh membuat endpoint atau schema yang tidak ada di OpenAPI.
- Tidak boleh mengakses PostgreSQL/MySQL langsung dari browser.
- IDR ditampilkan dengan formatter frontend; API menerima integer unit terkecil.
- `idSantri` dipilih dari data students bila tersedia, bukan input bebas.
- Mutasi harus me-refresh query/list yang terdampak.

## 5. Aturan UI/UX

Setiap halaman wajib memiliki state yang sesuai:

- loading/skeleton;
- empty;
- success;
- validation error;
- forbidden;
- not found;
- conflict;
- network/server error.

Tombol mutasi harus disabled selama submit berlangsung. Aksi release, archive, dan aksi destruktif harus menggunakan konfirmasi.

## 6. Konfigurasi environment

Development:

```env
VITE_API_BASE_URL=http://localhost:4054
VITE_API_PREFIX=/api/v1
VITE_APP_ENV=development
```

Nilai production/staging harus berasal dari environment deployment, bukan hardcode di source.
