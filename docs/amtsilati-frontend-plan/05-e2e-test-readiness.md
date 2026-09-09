# E2E Test Readiness

Dokumen ini adalah checklist persiapan sebelum mutation seluruh modul admin diuji terhadap backend development.

## Yang perlu disiapkan

- Backend berjalan di `http://localhost:4054` dan route API tersedia di `/api/v1`.
- CORS backend mengizinkan origin frontend yang dipakai, idealnya `http://localhost:5173`.
- OpenAPI terbaru sudah sama dengan backend yang sedang berjalan.
- Akun admin dengan permission penuh untuk mutation: `users.manage`, `students.read`, `syahriyah.manage`, `store.manage`, `events.manage`, dan `events.publish`.
- Akun admin kedua tanpa `events.publish` untuk menguji forbidden publish/unpublish.
- Dataset development/fixture terisolasi; jangan memakai katalog produksi.
- ID atau prefix fixture yang mudah dicari untuk cleanup, misalnya `E2E_AMTSILATI_<tanggal>`.
- Prosedur cleanup atau endpoint/database reset yang dijalankan oleh pemilik backend, bukan browser frontend.
- Jika menguji Store upload, Cloudinary development folder dan kredensial signed upload backend sudah aktif. `apiSecret` tetap hanya berada di backend.
- Chromium tersedia jika ingin menjalankan browser automation; jika tidak, siapkan browser manual/In-app Browser.

## Skenario minimum keseluruhan

1. Login admin valid, login invalid, protected route, refresh session, logout, dan session expired.
2. Admin Users: create, edit profile, update password, dan 403.
3. Students: list/filter/detail read-only dan 403.
4. Syahriyah: sync, tariff, snapshot, assign, release, conflict 409, polling timeout, dan cleanup.
5. Store: signed upload, create, edit, filter, dan cleanup asset/product.
6. Calendar Events: create DRAFT Gregorian/Hijri, edit partial, publish/unpublish dengan dua profil permission, archive, 400/403/404, dan cleanup.

## Bukti yang dikumpulkan

- Commit SHA dan hasil `bun run format:check`, `bun run lint`, `bun run test:unit`, serta `bun run build`.
- Daftar URL/endpoint yang diuji dan HTTP status tanpa access token, refresh token, password, signature, atau secret.
- Screenshot state penting: loading, empty, validation, forbidden, not-found, conflict, success, dan error.
- Daftar fixture yang dibuat, status cleanup, serta approval jika fixture sengaja dipertahankan.

## Batasan keamanan

Frontend tidak boleh menerima `X-Internal-Token`, `apiSecret`, akses database, atau mencetak JWT/password. Semua mutation tetap melewati admin JWT dan backend permission enforcement.

## Evidence pengujian 2026-09-09

- Backend `http://127.0.0.1:4054` aktif; health `/api/v1/health` merespons `200` dan CORS preflight dari `http://localhost:5173` merespons `204`.
- Login admin JWT berhasil. Endpoint users, students, products, signed upload params, sync status, tariffs, dan pengurus merespons `200`; snapshot `1447-01` merespons `404` karena belum tersedia.
- Calendar Events: create/edit/archive Gregorian berhasil; create/archive Hijri berhasil; invalid ONCE + range `400`; publish tanpa `events.publish` `403`; not-found `404`; tanpa JWT `401`. Fixture baru pada pengujian ini langsung diarsipkan.
- Admin Users: fixture id 4 berhasil di-update profile dan password secara reversible lalu di-restore. Store product id 2 berhasil di-update lalu di-restore; invalid product menghasilkan `400`. Syahriyah tariff existing berhasil di-upsert dengan nilai yang sama, snapshot `1447-10` berhasil di-rebuild, dan student sync berhasil dipoll sampai `success`.
- Syahriyah assign/release berhasil pada student fixture `B1800110`; hasil akhir `active=[]`. Dua trigger sync cepat menghasilkan trigger pertama sukses dan trigger kedua conflict “Sync already running”; polling berikutnya berakhir `success`.
- Retest event setelah perbaikan backend berhasil: akun `event_publisher` dengan effective permission `events.publish` dapat publish dan unpublish (`200`), sedangkan admin dapat archive event (`200`, status `ARCHIVED`). User melaporkan cleanup prefix `E2E_EVENTS_` sudah dijalankan.
- Retest tambahan: fixture `E2E_USERS_20260909` tanpa `users.manage` menerima `403` pada list Admin Users; fixture `E2E_STORE_20260909` berhasil dibuat dan diubah (`200`). User telah menjalankan cleanup untuk kedua prefix tersebut. Browser runtime Events berhasil create/edit/archive; publish UI masih perlu pengulangan dengan selector combobox yang sesuai.
- Setelah migration backend: Store fixture `E2E_STORE_DELETE_MIGRATION_20260910` berhasil dibuat (`200`), di-soft-delete (`200`), dan detail sesudahnya mengembalikan `404`.
- Browser retest: Admin User create dan Store product delete berhasil melalui UI. Events create/edit/archive, refresh form, publish, dan unpublish berhasil melalui UI; opsi Published aktif setelah session identity dipulihkan.
- Signed upload Cloudinary aktual terbaru berhasil (`200`) dan `secure_url` dikembalikan. Asset tidak dihapus sesuai instruksi user; lifecycle delete asset tetap menjadi catatan operasional.
- Retest Store soft delete pada backend development: fixture `E2E_STORE_DELETE_20260910` berhasil dibuat (`200`, id `4`), tetapi DELETE mengembalikan `405` dan detail product masih `200`; kontrak runtime belum sesuai OpenAPI.
- `bun run format:check`, `bun run lint`, `bun run test:unit` (48 test), `bun run build`, dan `bun run test` (57 browser test) berhasil setelah Chromium Playwright dipasang. Smoke browser nyata juga berhasil untuk protected redirect, login, seluruh route aktif, dan viewport mobile 390px tanpa horizontal overflow. `bun run knip` tetap non-zero karena foundation reusable/dependency yang belum dipakai.
- Backend sempat restart pada sebagian percobaan, tetapi endpoint kembali aktif dan retest API event terbaru berhasil melalui `http://127.0.0.1:4054`.
