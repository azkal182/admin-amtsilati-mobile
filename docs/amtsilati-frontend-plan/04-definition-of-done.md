# Definition of Done dan Traceability

## Definition of Done per halaman

Sebuah halaman dianggap selesai jika:

- route dan navigation sudah tersedia;
- API endpoint dan schema memiliki mapping yang jelas;
- permission dan forbidden behavior diterapkan;
- loading, empty, success, validation, not-found, conflict, dan server error state tersedia sesuai kebutuhan;
- query state penting tersimpan di URL;
- mutasi memiliki pending state, invalidation, dan feedback;
- tidak ada data mock pada production path;
- responsive dan accessibility dasar sudah diperiksa;
- test relevan tersedia;
- lint dan typecheck berhasil.

## Traceability endpoint ke feature

| Feature | Endpoint utama | Permission |
|---|---|---|
| Auth | `/internal/admin/auth/login`, `/token/refresh`, `/logout` | authenticated flow |
| Admin Users | `/internal/admin/users*` | `users.manage` |
| Students | `/internal/admin/students*` | `students.read` |
| Sync | `/internal/admin/syahriyah/sync/students*` | `syahriyah.manage` |
| Tariff | `/internal/admin/syahriyah/tariffs` | `syahriyah.manage` |
| Snapshot | `/internal/admin/syahriyah/snapshots*` | `syahriyah.manage` |
| Pengurus | `/internal/admin/syahriyah/pengurus*` | `syahriyah.manage` |
| Store | `/internal/admin/store/*` | `store.manage` |
| Events | `/internal/admin/events*` | `events.manage`, publish memakai `events.publish` |
| Dashboard | `/health` dan query modul tersedia | sesuai modul |

## Contract change policy

Jika backend mengubah endpoint, schema, status, permission, atau envelope:

1. OpenAPI harus diperbarui lebih dulu.
2. Dampak ke feature dan API types harus dicatat.
3. Test contract dan UI harus diperbarui.
4. Gate fase terkait dianggap invalid sampai verifikasi ulang selesai.

## Release checklist

- [ ] Branding Amtsilati konsisten.
- [ ] Development memakai `http://localhost:4054`.
- [ ] Environment production tidak memakai URL development.
- [ ] Tidak ada Clerk atau demo route.
- [ ] Tidak ada penggunaan `X-Internal-Token` dari frontend.
- [ ] Admin JWT flow tervalidasi.
- [ ] Semua modul aktif memiliki status fase dan gate.
- [ ] Dokumentasi ini diperbarui jika scope berubah.
