# Auth, RBAC, Permission, dan Audit

## 1. Admin session flow

1. Kirim `POST /api/v1/internal/admin/auth/login` dengan username dan password.
2. Simpan access token di memory/session store yang aman.
3. Simpan refresh token pada secure storage sesuai platform; untuk web prioritaskan cookie `HttpOnly`, `Secure`, dan `SameSite` melalui kebijakan deployment.
4. Sertakan `Authorization: Bearer <admin_access_token>` pada request internal.
5. Saat menerima 401, lakukan maksimal satu refresh menggunakan `POST /api/v1/internal/admin/auth/token/refresh`.
6. Refresh token dapat dikirim pada body `{ "refreshToken": "..." }` atau header `refreshtoken`.
7. Jika refresh gagal, hapus session dan arahkan ke login.
8. Logout memanggil `POST /api/v1/internal/admin/auth/logout`, lalu selalu bersihkan session lokal.

Jangan retry otomatis untuk 403, 404, 409, atau validation errors. Retry hanya untuk refresh 401 dan kebijakan network yang memang idempotent.

## 2. Token context

Admin access token memiliki context terpisah dari user token:

- Admin access: `typ=admin_access`, audience `sidafa:admin`.
- Admin refresh: `typ=admin_refresh`, audience `sidafa:admin`.
- User token tidak boleh dipakai untuk endpoint admin.

Frontend tidak perlu memverifikasi signature JWT untuk authorization bisnis; backend tetap sumber keputusan. Payload token boleh dipakai sekadar untuk informasi tampilan jika diperlukan, tetapi jangan percaya claim permission tanpa verifikasi server.

## 3. Permission yang tersedia

| Permission | Modul/kemampuan |
|---|---|
| `users.manage` | Kelola admin user |
| `students.read` | Baca snapshot santri |
| `syahriyah.manage` | Operasional Syahriyah |
| `events.manage` | Kelola event kalender (buat, ubah, archive) |
| `events.publish` | Publish atau unpublish event kalender |
| `content.manage` | Rencana kelola content; endpoint belum tersedia |
| `content.publish` | Rencana publish content; endpoint belum tersedia |
| `store.manage` | Kelola katalog store |
| `calendar.adjust` | Penyesuaian kalender Hijriyah; endpoint belum tersedia |

Role seed saat ini: `super_admin`, `event_editor`, `event_publisher`, `content_editor`, `store_manager`, dan `calendar_manager`.

Saat ini response `GET /internal/admin/users/me` belum mengembalikan daftar permission. Karena itu, frontend tidak boleh menganggap response tersebut sebagai sumber permission dinamis. Gunakan menu capability yang dikonfigurasi sementara atau tunggu endpoint access profile khusus.

## 4. Permission UX

- Sembunyikan menu yang tidak relevan jika capability sudah diketahui.
- Tetap tangani 403 pada setiap request karena visibility UI bukan security boundary.
- Sediakan empty/forbidden state yang berbeda.
- Jangan menampilkan tombol mutasi pada data yang hanya memiliki permission read.

## 5. Audit log

Mutasi backoffice diaudit backend. Audit mencatat actor admin, action/method, resource, resource ID jika ada, path, status response, request ID, metadata, dan waktu.

Belum ada endpoint frontend untuk membaca audit log. Jangan membuat halaman audit viewer yang bergantung pada endpoint yang belum tersedia. Jika endpoint tersebut ditambahkan nanti, gunakan pagination/filter server-side dan jangan menampilkan metadata sensitif secara default.
