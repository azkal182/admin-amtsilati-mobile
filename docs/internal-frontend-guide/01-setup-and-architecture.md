# Setup, Arsitektur, dan Boundary

## 1. Prinsip aplikasi

Panel internal adalah aplikasi backoffice untuk operator/staff. Pisahkan secara jelas:

- `adminApi`: auth admin, RBAC, user management, student helper, Syahriyah operations, store management.
- `clientApi`: aplikasi santri/user; bukan bagian dari panel internal.
- `publicApi`: endpoint yang memang tidak memerlukan token, misalnya health dan katalog store client.

Frontend tidak boleh menggabungkan token atau service client dan admin. Buat API client terpisah dengan base URL yang sama tetapi policy auth berbeda.

## 2. Struktur frontend agnostik

Struktur konseptual yang disarankan:

```text
app/
  router/              # route guard dan navigasi
  auth/                # session admin, refresh, logout
  api/
    admin-client       # Authorization admin JWT
    error-mapper       # mapping status/error.code ke UI
  layouts/             # auth layout dan backoffice layout
  features/
    admin-users/
    calendar-events/
    students/
    syahriyah/
    store/
  components/          # table, form, modal, pagination, feedback
  shared/
    types/              # tipe dari OpenAPI
    formatters/         # IDR, tanggal, periode Hijriyah
```

Nama folder bebas; boundary fitur dan service lebih penting daripada framework.

## 3. Environment frontend

Sediakan konfigurasi runtime/build berikut:

| Variable | Keterangan |
|---|---|
| `API_BASE_URL` | Origin API, misalnya `https://api.example.com` |
| `API_PREFIX` | Default `/api/v1` |
| `APP_ENV` | development/staging/production |

Calendar public API diaktifkan backend melalui feature `SIDAFA_FEATURES_INTERNAL_CALENDAR_ENABLED=true` (atau saat internal admin aktif). Frontend tidak perlu mengelola feature flag backend ini; frontend cukup menangani response endpoint yang tersedia.

Jangan menyimpan JWT secret, refresh secret, database DSN, Cloudinary API secret, atau internal token di frontend. `apiKey` pada signed upload boleh diterima karena bersifat public upload key; `signature` tetap hanya digunakan sesuai TTL.

## 4. Route guard

Minimal sediakan guard:

- `PublicRoute`: login.
- `AdminAuthenticatedRoute`: semua `/internal/admin/*`.
- `PermissionRoute`: pembatasan tampilan berdasarkan kemampuan modul, tetapi keputusan final tetap di backend.

Jika session admin tidak tersedia, arahkan ke halaman login. Jika API mengembalikan 403, tampilkan halaman/komponen forbidden, bukan menganggap token expired.

## 5. Data ownership

Frontend hanya berkomunikasi melalui API. Jangan mengimplementasikan query database, membaca schema PostgreSQL, atau menghubungkan aplikasi browser/mobile langsung ke database.
