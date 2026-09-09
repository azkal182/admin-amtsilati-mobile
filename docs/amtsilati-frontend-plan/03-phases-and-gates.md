# Fase Implementasi, Checklist, dan Gate

## Fase 0 — Audit dan cleanup template

### Pekerjaan

- Inventarisasi dependency, route, asset, dan komponen reusable.
- Hapus demo Tasks, Apps, Chats, Clerk, mock data, social login, dan dashboard dummy.
- Pertahankan UI primitives, layout base, table, form, dialog, theme, dan test utility yang masih digunakan.
- Ganti title, metadata, favicon, logo, dan copy menjadi Amtsilati.
- Pastikan route tree dibuat ulang oleh TanStack Router.

### Checklist

- [x] Tidak ada import Clerk.
- [x] Tidak ada `mock-access-token`, `sleep`, faker, atau mock business data pada production path.
- [x] Sidebar hanya berisi menu Amtsilati.
- [x] Branding template hilang dari UI dan README aplikasi.
- [x] Dependency demo yang tidak terpakai dihapus.
- [x] `lint` dan `build` masih berhasil.

### Gate 0

Lulus jika project hanya menyisakan fondasi UI dan route skeleton Amtsilati, tanpa demo template yang dapat diakses user. Gate ini lulus pada 2026-09-09 berdasarkan verifikasi lint, format check, dan build menggunakan Bun 1.4.0. Targeted browser test sudah dicoba menggunakan Bun, tetapi belum dapat dijalankan karena executable Chromium Playwright tidak tersedia dan Vitest tidak mendapatkan port browser pada environment; test diulang pada fase quality/release setelah runtime browser tersedia.

## Fase 1 — Foundation, API client, dan shell

### Pekerjaan

- Tambahkan environment config untuk `http://localhost:4054` dan `/api/v1`.
- Buat admin API client dan response envelope parser.
- Buat error mapper dan global feedback primitives.
- Buat authenticated layout, sidebar, header, breadcrumb, profile, dan navigation capability.
- Buat route skeleton modul aktif.

### Checklist

- [ ] Base URL tidak hardcode.
- [ ] Admin client terpisah dari auth client.
- [ ] Request protected memiliki bearer admin token.
- [ ] Response pagination dan non-pagination dapat diparse.
- [ ] Error menyimpan `requestId`.
- [ ] Sidebar tidak menampilkan endpoint client/user.
- [ ] Loading, empty, error, dan forbidden primitives tersedia.

### Gate 1

Lulus jika seluruh route skeleton dapat dirender, API layer teruji secara unit, dan tidak ada boundary admin/user yang tercampur.

## Fase 2 — Admin authentication dan session lifecycle

### Pekerjaan

- Implementasi halaman login admin.
- Login ke `/internal/admin/auth/login`.
- Simpan access token pada session store yang aman untuk deployment web.
- Implementasi refresh token satu kali saat 401.
- Implementasi logout, session expired, dan redirect.
- Implementasi forbidden untuk 403.

### Checklist

- [ ] Field login menggunakan username/password.
- [ ] Login success mengisi user profile dan token.
- [ ] Login 400/401 menampilkan feedback yang tepat.
- [ ] Refresh tidak loop.
- [ ] Refresh gagal menghapus session.
- [ ] Logout tetap membersihkan session jika API gagal.
- [ ] Tidak ada token/password di log.
- [ ] Route admin tidak dapat diakses tanpa session.

### Gate 2

Lulus jika login, protected route, refresh, logout, 401, 403, dan session expired dapat diverifikasi melalui test dan manual flow.

## Fase 3 — Admin Users dan Students

### Pekerjaan

- Admin Users: list, search, pagination, create, edit profile, update password.
- Students: list, search, status filter, pagination, detail snapshot read-only.
- Permission UX untuk `users.manage` dan `students.read`.

### Checklist

- [ ] Data memakai endpoint admin yang benar.
- [ ] Pagination server-side.
- [ ] Search/filter tersimpan di URL.
- [ ] Form mengikuti schema OpenAPI.
- [ ] Password tidak pernah ditampilkan kembali.
- [ ] Student detail bersifat read-only.
- [ ] 403 membedakan forbidden dari empty.
- [ ] Mutasi melakukan invalidation query.

### Gate 3

Lulus jika semua CRUD admin user yang tersedia dan read-only student flow berjalan terhadap API/dev mock, dengan validasi dan error state lengkap.

## Fase 4 — Syahriyah Operations

### Pekerjaan

- Sync students dan status polling 2–5 detik dengan timeout UI wajar.
- Tariff list dan upsert periode/kategori/nominal.
- Snapshot rebuild dan lookup `YYYY-MM`.
- Pengurus list, assign, dan release.
- Integrasikan student picker.

### Checklist

- [ ] Hanya memakai `/internal/admin/syahriyah/*`.
- [ ] Tidak mengirim `X-Internal-Token`.
- [ ] Trigger sync tidak dapat dijalankan paralel dari UI.
- [ ] 409 sync running ditampilkan sebagai conflict yang jelas.
- [ ] Polling berhenti pada success, failed, timeout, atau unmount.
- [ ] Nominal diformat sebagai IDR.
- [ ] Release membutuhkan konfirmasi.
- [ ] Form periode mengikuti format `YYYY-MM`.

### Gate 4

Lulus jika sync, tariff, snapshot, dan pengurus dapat dijalankan tanpa memakai endpoint legacy atau internal token tambahan.

## Fase 5 — Store Management

### Pekerjaan

- Product list, filter available, search, pagination, detail, create, edit.
- Signed upload flow ke Cloudinary.
- Validasi image URL HTTPS, price non-negative, dan `maxBuy >= 1`.

### Checklist

- [ ] Signed params diminta dari endpoint admin.
- [ ] `apiSecret` tidak pernah diterima/dikirim frontend.
- [ ] Secure URL upload digunakan saat save product.
- [ ] Retry 429 menggunakan backoff terbatas.
- [ ] Submit disabled selama upload/mutation.
- [ ] Query product di-refresh setelah create/update.
- [ ] Error upload dan error product dibedakan.

### Gate 5

Lulus jika product lifecycle dan signed upload tervalidasi di development tanpa secret bocor ke bundle atau log.

## Fase 6 — Calendar Events

### Pekerjaan

- List event dengan filter scope, category, status.
- Detail, create, edit partial, archive.
- Form date rule Gregorian/Hijri, once/yearly, range, category, priority, dan status.
- Permission `events.manage` dan `events.publish`.

### Checklist

- [ ] Event ID diperlakukan sebagai UUID.
- [ ] PATCH hanya mengirim field yang berubah atau memang dimaksudkan.
- [ ] Archive menggunakan DELETE sesuai contract.
- [ ] Publish/unpublish dibatasi permission publish.
- [ ] ONCE tidak menerima range.
- [ ] Fallback lokal tersedia untuk icon/color semantic token.
- [ ] Detail 404 memiliki state khusus.

### Gate 6

Lulus jika event draft/published/archived dapat dikelola sesuai permission dan aturan date rule OpenAPI.

## Fase 7 — Hardening, testing, dan release readiness

### Pekerjaan

- Test unit/integration untuk API, auth, permission, forms, upload, polling, dan route guard.
- Accessibility dan responsive review.
- Performance review query/cache dan code splitting.
- Final cleanup dependency, dead code, README, dan environment example.
- Build production dan smoke test.

### Checklist

- [ ] `lint` berhasil.
- [ ] `build` berhasil.
- [ ] Test suite berhasil.
- [ ] Tidak ada secret/token pada log atau bundle.
- [ ] Semua route memiliki loading/error/empty state.
- [ ] Keyboard navigation dan focus state diperiksa.
- [ ] Mobile/tablet/desktop layout diperiksa.
- [ ] OpenAPI traceability selesai.

### Gate 7

Lulus jika seluruh modul aktif memenuhi Definition of Done, build production berhasil, dan tidak ada blocker keamanan atau contract mismatch.
