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

Status terbaru 2026-09-10: API RBAC tanpa `users.manage` sudah terverifikasi `403` dan fixture `E2E_USERS_` sudah dibersihkan. Yang tersisa hanya browser mutation Admin Users.

Retest browser terbaru: create Admin User melalui UI berhasil dengan fixture `E2E_USERS_BROWSER_2311`. Cleanup fixture tersebut masih perlu dijalankan.

Status terbaru: API RBAC sudah lulus dengan user fixture tanpa `users.manage` (`403`), dan cleanup `E2E_USERS_` telah dikonfirmasi user. Browser mutation Admin Users belum diverifikasi secara runtime.

Retest API tambahan: fixture `E2E_USERS_20260909` dengan role `event_editor` tidak memiliki `users.manage` dan menerima `403` pada list Admin Users. Browser mutation dan cleanup fixture user masih tersisa.

Lulus jika semua CRUD admin user yang tersedia dan read-only student flow berjalan terhadap API/dev mock, dengan validasi dan error state lengkap. Implementasi Fase 3 selesai pada 2026-09-09: endpoint Admin Users dan Students terpetakan ke admin client, form tervalidasi, query state tersimpan di URL, mutation meng-invalidate list, dan Students memiliki adapter untuk respons backend aktual yang masih menggunakan field `IDSantri`, `NIS`, `Nama`, `Alamat`, `Status` alih-alih casing OpenAPI. Unit suite (23 test), lint, format check, dan build berhasil. Smoke backend untuk list Admin Users, list Students, dan detail Students menghasilkan `200`; smoke browser memverifikasi list Admin Users serta filter Students. Mutation Admin Users create sudah memiliki fixture retained dari pengujian sebelumnya; update profile dan update password diuji secara reversible pada fixture id 4 dan berhasil di-restore. Gate 3 masih memerlukan verifikasi browser mutation, 403 dengan akun tanpa `users.manage`, serta keputusan cleanup fixture dan penyelarasan contract casing Students.

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

Lulus jika sync, tariff, snapshot, dan pengurus dapat dijalankan tanpa memakai endpoint legacy atau internal token tambahan. Implementasi Fase 4 selesai pada 2026-09-09 dengan API client, form validation, bounded sync polling, conflict handling, invalidation, student picker, dan release confirmation. Unit suite, lint, format check, dan build berhasil. Smoke backend menghasilkan `200` untuk sync status, tariffs, dan pengurus; snapshot `1447-01` menghasilkan `404` sesuai state not-found. Mutation tariff upsert dengan nilai existing yang sama berhasil; rebuild snapshot `1447-10` berhasil; sync trigger berhasil dan polling berhenti pada `success`; trigger paralel menghasilkan conflict `409`; assign/release pengurus pada student fixture berhasil dan verifikasi akhir menunjukkan tidak ada assignment aktif tersisa. Gate 4 lulus untuk API/mutation; browser verification tercakup pada browser suite dan smoke route, dengan fixture history assignment tetap tersimpan sebagai riwayat backend.

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
- [x] Delete product memakai soft delete, confirmation, dan invalidation query.

### Gate 5

Status terbaru 2026-09-10: frontend delete product sudah tersedia; create/update, signed upload parameters, dan soft delete runtime sudah diverifikasi (`DELETE 200`, detail sesudahnya `404`). Yang tersisa adalah upload file Cloudinary aktual, browser mutation delete, dan lifecycle delete asset Cloudinary.

Retest browser terbaru: delete product melalui UI berhasil dengan confirmation dialog, toast sukses, dan redirect kembali ke list. Upload file aktual masih ditahan sampai lifecycle delete asset Cloudinary tersedia.

Retest terbaru sesuai keputusan user: signed upload Cloudinary aktual berhasil (`200`) dan mengembalikan `secure_url`; pengujian dilakukan tanpa delete asset. Dengan pengecualian lifecycle cleanup asset, Gate 5 dapat dianggap selesai/accepted.

Status terbaru: list, signed upload parameters, serta create/update product fixture sudah lulus melalui API. Cleanup `E2E_STORE_` telah dikonfirmasi user. Upload file Cloudinary aktual menunggu fitur delete asset backend selesai.

Frontend delete product sudah diimplementasikan dengan confirmation dialog, mutation `DELETE /internal/admin/store/products/{id}`, invalidation list/detail, dan success/error feedback. Retest runtime setelah migration backend menghasilkan create `200`, DELETE `200`, dan GET detail sesudah delete `404`. Gate 5 tinggal menunggu verifikasi upload file aktual dan browser mutation delete.

Retest API tambahan: create dan update fixture `E2E_STORE_20260909` berhasil dengan status `200`; signed upload parameters juga berhasil dengan status `200`. Upload file aktual dan cleanup fixture Store masih tersisa.

Implementasi Fase 5 selesai pada 2026-09-09: product list/filter/search/pagination/detail/create/edit, validasi form, signed Cloudinary upload, retry 429 terbatas, permission/error states, dan query invalidation tersedia. Unit suite (28 test), lint, format check, TypeScript, dan production build berhasil. Smoke backend ke `http://127.0.0.1:4054` menghasilkan `200` untuk product list dan signed upload; update produk pertama diuji lalu di-restore, dan invalid product payload menghasilkan `400`. Gate 5 masih memerlukan verifikasi upload Cloudinary aktual dan mutation create dengan fixture yang dapat dihapus/di-reset, serta browser verification.

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

Gate 6 lulus untuk implementasi contract dan UI pada 2026-09-09: list dengan filter scope/category/status dan pagination URL, detail/create/edit partial, archive via DELETE, validasi date rule Gregorian/Hijri, status draft/published/archived, permission `events.manage` dan `events.publish`, serta fallback label kategori tersedia. Unit suite (31 test), lint, format check, TypeScript, dan production build berhasil. Smoke backend ke `http://127.0.0.1:4054` menghasilkan `200` untuk list event. Verifikasi mutation runtime dipindahkan ke Fase 6.1.

## Fase 6.1 — Calendar Events Mutation dan E2E Verification

### Alasan pemisahan

Implementasi mutation sudah tersedia di frontend. Fase ini membuktikan perilaku runtime end-to-end dengan akun permission yang tepat, data uji terisolasi, dan prosedur cleanup.

### Pekerjaan

- Jalankan create event DRAFT dengan date rule Gregorian dan Hijri.
- Jalankan edit partial untuk field biasa, date rule, dan clear nullable field.
- Verifikasi publish/unpublish dengan akun yang memiliki `events.publish` dan akun tanpa permission tersebut.
- Verifikasi archive melalui DELETE dan hasil status ARCHIVED.
- Verifikasi 400, 403, 404, dan refresh session pada mutation.
- Bersihkan seluruh event uji dan simpan bukti request/response tanpa token.

### Checklist

- [x] Backend dev berjalan dan CORS mengizinkan origin frontend (`/api/v1/health` 200; preflight `204`; origin `http://localhost:5173`).
- [x] Tersedia event uji yang aman untuk dibuat/diubah/diarsipkan.
- [x] Create DRAFT berhasil untuk basis Gregorian.
- [x] Create DRAFT berhasil untuk basis Hijri.
- [x] ONCE dengan range ditolak oleh backend (`400`).
- [x] Edit partial berhasil; respons backend mempertahankan field yang tidak dikirim.
- [x] Publish/unpublish berhasil dengan akun yang memiliki `events.publish`; akun tanpa permission tetap harus dipertahankan sebagai regression case `403`.
- [x] Archive menghasilkan status `ARCHIVED`; fixture yang dibuat pada pengujian ini langsung diarsipkan.
- [x] `401`, `403`, `404`, dan `400` terverifikasi melalui API.
- [x] Seluruh data uji event selesai di-cleanup: user menjalankan `go run ./cmd/cleanup-fixtures --prefix E2E_EVENTS_` pada project backend.

### Gate 6.1

Status: **passed** pada 2026-09-10. API create/edit/publish/unpublish/archive lulus. Browser nyata berhasil login, create, edit, refresh form, publish, unpublish, dan archive event; opsi Published tetap aktif setelah refresh karena identity admin dipulihkan dari session storage. Fixture browser terbaru sudah diarsipkan; cleanup prefix `E2E_EVENTS_` tetap perlu dijalankan ulang untuk fixture test yang baru dibuat.

Retest 2026-09-10: browser create/edit/archive berhasil; publish dan unpublish melalui UI berhasil dengan opsi `Published` aktif. API publish/unpublish juga tetap lulus.

Retest lanjutan: akar masalah sebelumnya adalah identity admin hilang setelah refresh, sehingga query effective access tidak berjalan. Session identity sekarang dipulihkan dan request access merespons `200`.

## Fase 7 — Hardening, testing, dan release readiness

### Pekerjaan

- Test unit/integration untuk API, auth, permission, forms, upload, polling, dan route guard.
- Accessibility dan responsive review.
- Performance review query/cache dan code splitting.
- Final cleanup dependency, dead code, README, dan environment example.
- Build production dan smoke test.

### Checklist

- [x] `lint` berhasil.
- [x] `build` berhasil.
- [x] Test suite unit berhasil (31 test).
- [x] Tidak ada secret/token pada changed production path; audit `X-Internal-Token`, JWT, password, dan API secret dilakukan.
- [x] Semua route aktif memiliki state loading/error/empty yang relevan.
- [ ] Keyboard navigation dan focus state diperiksa secara manual pada browser desktop.
- [x] Mobile/tablet/desktop layout diperiksa.
- [x] OpenAPI traceability untuk endpoint aktif tersedia di Definition of Done.

### Gate 7

Status terbaru 2026-09-10: Chromium dapat berjalan di luar sandbox dan browser suite 57/57 lulus. Audit release masih menunggu Store upload/delete E2E, browser mutation penuh, keyboard/focus review, cleanup fixture event terbaru, dan keputusan `knip`.

Fase 7 audit otomatis diulang pada 2026-09-09: format check, lint, 48 unit test, TypeScript, dan production build berhasil. Browser suite berhasil setelah Chromium Playwright dijalankan di luar sandbox: 7 test files dan 57 test pass. Smoke browser nyata memverifikasi protected redirect, login, seluruh route aktif, mobile layout, serta Events create/edit/archive; viewport 390px tidak memiliki horizontal overflow pada route aktif. API smoke lintas modul berhasil: users, students, store products, signed upload, Store create/update, sync status, tariffs, pengurus, snapshot rebuild, serta event publish/unpublish/archive dan RBAC Admin Users `403`. CORS frontend `204` dan mengizinkan `http://localhost:5173`. `knip` tetap non-zero dan melaporkan 15 komponen foundation, 6 dependency, serta beberapa export yang belum dipakai; item tersebut belum dihapus karena masih fondasi reusable dan memerlukan review cleanup terpisah. Gate 7 masih pending karena upload file Cloudinary aktual, browser mutation Admin Users/Store/Events penuh, keyboard/focus review, cleanup fixture Events terbaru, dan keputusan `knip`.
