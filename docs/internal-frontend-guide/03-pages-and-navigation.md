# Halaman dan Navigasi Internal

## 1. Shell aplikasi

### Public/auth

- `/login`: form username/password admin.
- `/session-expired`: informasi session berakhir dan CTA kembali login.
- `/forbidden`: user terautentikasi tetapi tidak memiliki permission.

### Backoffice layout

- Header: nama admin, status session, logout.
- Sidebar: menu berbasis modul/capability.
- Main content: breadcrumb, title, action area, content state.
- Global feedback: loading, success, validation, network error, forbidden, empty.

## 2. Navigasi aktif berdasarkan API saat ini

| Menu | Halaman | Endpoint utama | Permission |
|---|---|---|---|
| Dashboard | Ringkasan operasional | health + ringkasan modul yang tersedia | sesuai modul |
| Admin Users | List, create, edit, password | `/internal/admin/users*` | `users.manage` |
| Students | List dan detail snapshot | `/internal/admin/students*` | `students.read` |
| Syahriyah | Sync, status, tariff, snapshot, pengurus | `/internal/admin/syahriyah/*` | `syahriyah.manage` |
| Store | Product list/detail/create/edit, upload | `/internal/admin/store/*` | `store.manage` |

Dashboard belum memiliki endpoint agregasi khusus. Bangun dashboard secara modular dari endpoint yang tersedia atau tampilkan quick links; jangan mengarang schema dashboard backend.

## 3. Detail halaman

### Admin Users

- Filter/search dan pagination.
- Create admin: username, name, password.
- Edit profile: username, name.
- Update password: password baru.
- Access management: lihat role/permission efektif, assign role, dan revoke role.
- Tabel hanya menampilkan `id`, `username`, `name`, `isActive`.

### Students

- Search by `idSantri`, NIS, atau nama. Response snapshot menggunakan casing legacy `IDSantri`, `NIS`, `Nama`, `Alamat`, dan `Status`.
- Filter status.
- Detail snapshot bersifat read-only.
- Gunakan picker santri untuk kebutuhan flow Syahriyah, bukan input bebas jika data sudah tersedia.

### Syahriyah Operations

- Sync students: trigger async dan halaman status polling dengan interval konservatif.
- Tariff: list dan form upsert periode/kategori/nominal.
- Snapshot: rebuild dan lookup berdasarkan `YYYY-MM`.
- Pengurus: list, assign, release dengan konfirmasi untuk release.

### Store Management

- List filter `available`, search, pagination.
- Create/edit product dengan validasi HTTPS image URL, harga non-negatif, dan `maxBuy >= 1`.
- Upload image melalui signed upload flow, lalu simpan URL final pada product.

## 4. Domain rencana, belum boleh diaktifkan

Siapkan slot navigasi feature-flagged. Event kalender sudah memiliki API dan dapat ditampilkan jika admin memiliki permission terkait; domain content dan penyesuaian kalender masih menunggu kontrak API:

- Event kalender: `events.manage`, route halaman yang disarankan `/events`.
- Content aplikasi/buku: `content.manage`, `content.publish`.
- Penyesuaian kalender Hijriyah: `calendar.adjust`.

Halaman event kalender minimal terdiri dari daftar event, filter scope/status/category, form create/edit, dan aksi archive. Content dan penyesuaian kalender tetap menunggu API contract tersendiri.
