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

- [x] Base URL terpusat pada config environment; tidak di-hardcode pada feature.
- [x] Admin client terpisah dari auth client.
- [x] Request protected memiliki bearer admin token.
- [x] Response pagination dan non-pagination dapat diparse.
- [x] Error menyimpan `requestId`.
- [x] Sidebar tidak menampilkan endpoint client/user.
- [x] Loading, empty, error, dan forbidden primitives tersedia.

### Gate 1

Lulus jika seluruh route skeleton dapat dirender, API layer teruji secara unit, dan tidak ada boundary admin/user yang tercampur. Gate ini lulus pada 2026-09-09 berdasarkan `bun run test:unit` (12 test pass), `bun run lint`, `bun run format:check`, dan `bun run build`. Browser smoke test belum dapat dijalankan karena runtime Chromium Playwright dan port browser tidak tersedia di environment; akan diulang pada fase quality/release.

## Fase 2 — Admin authentication dan session lifecycle

### Pekerjaan

- Implementasi halaman login admin.
- Login ke `/internal/admin/auth/login`.
- Simpan access token pada session store yang aman untuk deployment web.
- Implementasi refresh token satu kali saat 401.
- Implementasi logout, session expired, dan redirect.
- Implementasi forbidden untuk 403.

### Checklist

- [x] Field login menggunakan username/password.
- [x] Login success mengisi user profile dan token.
- [x] Login 400/401 menampilkan feedback yang tepat.
- [x] Refresh tidak loop.
- [x] Refresh gagal menghapus session.
- [x] Logout tetap membersihkan session jika API gagal.
- [x] Tidak ada token/password di log.
- [x] Route admin tidak dapat diakses tanpa session.

### Gate 2

Lulus jika login, protected route, refresh, logout, 401, 403, dan session expired dapat diverifikasi melalui test dan manual flow. Gate 2 lulus pada 2026-09-09: `bun run test:unit` (20 test pass), `bun run lint`, `bun run format:check`, dan `bun run build` berhasil. Smoke langsung ke backend `http://127.0.0.1:4054` berhasil untuk login admin (`200`), refresh (`200`), logout (`200`), dan kredensial invalid (`401`). Browser smoke pada `http://localhost:5173` juga berhasil: protected redirect, login sukses, navigasi ulang yang memulihkan session, logout dan cleanup, invalid credentials, serta halaman 403/session expired. Origin `localhost:5173` digunakan karena termasuk allowlist CORS backend; `localhost:4173` dan `127.0.0.1` tidak termasuk allowlist. Chromium Playwright belum tersedia di environment, tetapi flow telah diverifikasi melalui In-app Browser.

## Fase 3 — Admin Users dan Students

### Pekerjaan

- Admin Users: list, search, pagination, create, edit profile, update password.
- Students: list, search, status filter, pagination, detail snapshot read-only.
- Permission UX untuk `users.manage` dan `students.read`.

### Checklist

- [x] Data memakai endpoint admin yang benar.
- [x] Pagination server-side.
- [x] Search/filter tersimpan di URL.
- [x] Form mengikuti schema OpenAPI.
- [x] Password tidak pernah ditampilkan kembali.
- [x] Student detail bersifat read-only.
- [x] 403 membedakan forbidden dari empty.
- [x] Mutasi melakukan invalidation query.

### Gate 3

Lulus jika semua CRUD admin user yang tersedia dan read-only student flow berjalan terhadap API/dev mock, dengan validasi dan error state lengkap. Implementasi Fase 3 selesai pada 2026-09-09: endpoint Admin Users dan Students terpetakan ke admin client, form tervalidasi, query state tersimpan di URL, mutation meng-invalidate list, dan Students memiliki adapter untuk respons backend aktual yang masih menggunakan field `IDSantri`, `NIS`, `Nama`, `Alamat`, `Status` alih-alih casing OpenAPI. Unit suite (23 test), lint, format check, dan build berhasil. Smoke backend untuk list Admin Users, list Students, dan detail Students menghasilkan `200`; smoke browser memverifikasi list Admin Users serta filter Students. Gate 3 masih memerlukan verifikasi mutation create/edit/password terhadap environment dev setelah contract casing Students diselaraskan atau mismatch adapter disetujui.

## Fase 4 — Syahriyah Operations

### Pekerjaan

- Sync students dan status polling 2–5 detik dengan timeout UI wajar.
- Tariff list dan upsert periode/kategori/nominal.
- Snapshot rebuild dan lookup `YYYY-MM`.
- Pengurus list, assign, dan release.
- Integrasikan student picker.

### Checklist

- [x] Hanya memakai `/internal/admin/syahriyah/*`.
- [x] Tidak mengirim `X-Internal-Token`.
- [x] Trigger sync tidak dapat dijalankan paralel dari UI.
- [x] 409 sync running ditampilkan sebagai conflict yang jelas.
- [x] Polling berhenti pada success, failed, timeout, atau unmount.
- [x] Nominal diformat sebagai IDR.
- [x] Release membutuhkan konfirmasi.
- [x] Form periode mengikuti format `YYYY-MM`.

### Gate 4

Lulus jika sync, tariff, snapshot, dan pengurus dapat dijalankan tanpa memakai endpoint legacy atau internal token tambahan. Implementasi Fase 4 selesai pada 2026-09-09 dengan API client, form validation, bounded sync polling, conflict handling, invalidation, student picker, dan release confirmation. Unit suite, lint, format check, dan build berhasil. Smoke read-only backend menghasilkan `200` untuk sync status, tariffs, dan pengurus; snapshot `1447-01` menghasilkan `404` sesuai state not-found. Gate 4 pending smoke mutation sync/tariff/rebuild/assign/release terhadap environment dev agar tidak mengubah data operasional tanpa prosedur cleanup.

## Fase 5 — Store Management

### Pekerjaan

- Product list, filter available, search, pagination, detail, create, edit.
- Signed upload flow ke Cloudinary.
- Validasi image URL HTTPS, price non-negative, dan `maxBuy >= 1`.

### Checklist

- [x] Signed params diminta dari endpoint admin.
- [x] `apiSecret` tidak pernah diterima/dikirim frontend.
- [x] Secure URL upload digunakan saat save product.
- [x] Retry 429 menggunakan backoff terbatas.
- [x] Submit disabled selama upload/mutation.
- [x] Query product di-refresh setelah create/update.
- [x] Error upload dan error product dibedakan.

### Gate 5

Implementasi Fase 5 selesai pada 2026-09-09: product list/filter/search/pagination/detail/create/edit, validasi form, signed Cloudinary upload, retry 429 terbatas, permission/error states, dan query invalidation tersedia. Unit suite (28 test), lint, format check, TypeScript, dan production build berhasil. Smoke backend ke `http://127.0.0.1:4054` menghasilkan `200` untuk product list dan signed upload; respons sensitif tidak dicetak. Gate 5 masih memerlukan verifikasi upload Cloudinary dan mutation create/edit dengan data uji yang disepakati agar tidak mengubah katalog operasional tanpa prosedur cleanup.

## Fase 6 — Calendar Events

### Pekerjaan

- List event dengan filter scope, category, status.
- Detail, create, edit partial, archive.
- Form date rule Gregorian/Hijri, once/yearly, range, category, priority, dan status.
- Permission `events.manage` dan `events.publish`.

### Checklist

- [x] Event ID diperlakukan sebagai UUID.
- [x] PATCH hanya mengirim field yang berubah atau memang dimaksudkan.
- [x] Archive menggunakan DELETE sesuai contract.
- [x] Publish/unpublish dibatasi permission publish.
- [x] ONCE tidak menerima range.
- [x] Fallback lokal tersedia untuk icon/color semantic token.
- [x] Detail 404 memiliki state khusus.

### Gate 6

Implementasi Fase 6 selesai pada 2026-09-09: list dengan filter scope/category/status dan pagination URL, detail/create/edit partial, archive via DELETE, validasi date rule Gregorian/Hijri, status draft/published/archived, permission `events.manage` dan `events.publish`, serta fallback label kategori tersedia. Unit suite (31 test), lint, format check, TypeScript, dan production build berhasil. Smoke backend ke `http://127.0.0.1:4054` menghasilkan `200` untuk list event. Gate 6 masih memerlukan verifikasi mutation create/edit/archive/publish menggunakan data uji development yang disepakati agar tidak mengubah kalender operasional tanpa prosedur cleanup.

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
