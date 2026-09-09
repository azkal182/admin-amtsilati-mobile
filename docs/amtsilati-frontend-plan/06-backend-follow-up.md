# Backend Follow-up untuk Gate Amtsilati

Dokumen ini berisi hasil retest kontrak/runtime pada 2026-09-09 menggunakan backend development `http://127.0.0.1:4054` dan admin JWT. Token, password, signature, dan request ID tidak dicatat di sini. Temuan diberi status agar tim backend dapat membedakan issue yang masih terbuka dari issue yang sudah diperbaiki.

## 1. RESOLVED — Event publisher permission sudah diterapkan pada mutation

Temuan awal sebelum backend diperbaiki:

Mutation publish/unpublish masih mengembalikan `403` walaupun endpoint access sudah mengembalikan `events.publish`.

Retest setelah backend diperbaiki:

1. Admin `super_admin` memiliki `events.publish` pada effective access.
2. Fixture user `E2E_EVENTS_publisher_20260909222340` (backend id `14`) memiliki role `event_publisher` dan permission `events.publish`.
3. Publisher berhasil publish dengan `PATCH .../events/{uuid}` body `{"status":"PUBLISHED"}` (`200`).
4. Publisher berhasil unpublish dengan body `{"status":"DRAFT"}` (`200`).
5. Admin berhasil archive event dengan `DELETE .../events/{uuid}` (`200`, status `ARCHIVED`).

Expected:

- Role `event_publisher` dengan permission `events.publish` dapat publish dan unpublish event.
- User tanpa `events.publish` tetap mendapat `403`.

Status: **resolved**. Retain regression coverage so users without `events.publish` still receive `403`, and ensure the permission claim is refreshed when a role is assigned.

## 2. RESOLVED — Tariff upsert sebelumnya tidak idempotent

Temuan awal:

- `POST /api/v1/internal/admin/syahriyah/tariffs` dengan nilai existing `hijriPeriod=1447-10`, `category=santri_biasa`, dan amount yang sama berhasil.
- Setelah request tersebut, runtime lama mengembalikan dua item dengan key kombinasi yang sama: `1447-10/santri_biasa`.

Retest terbaru:

- Count item dengan key tersebut sebelum upsert: `1`.
- Upsert ulang dengan nilai yang sama: `200 Tariff saved`.
- Count sesudah upsert: `1`.

Status: **resolved**. Mohon tetap pertahankan unique constraint dan perilaku upsert idempotent.

Expected:

- Upsert berdasarkan kombinasi `(hijriPeriod, category)` memperbarui row yang sama atau menolak duplicate secara konsisten.
- Request yang sama berulang kali tidak menambah row baru.

Frontend tetap memakai key fallback agar resilient terhadap data lama yang pernah duplicate.

## 3. RESOLVED — Casing response Students sudah diselaraskan

OpenAPI terbaru dan runtime sekarang sama-sama menggunakan casing legacy:

```json
{"IDSantri":"...","NIS":"...","Nama":"...","Alamat":"...","Status":"..."}
```

Endpoint terdampak:

- `GET /api/v1/internal/admin/students`
- `GET /api/v1/internal/admin/students/{idSantri}`

Status: **resolved**. `GET /internal/admin/students` dan detail student mengembalikan `IDSantri`, `NIS`, `Nama`, `Alamat`, `Status`, sesuai OpenAPI terbaru dan guide internal.

## 4. ACCEPTED — Kontrak `X-Internal-Token`

Sesuai keputusan terbaru, temuan dokumentasi ini diabaikan dan tidak menjadi blocker frontend. Frontend admin tetap tidak mengirim `X-Internal-Token`; seluruh akses yang dibangun menggunakan admin JWT.

## 5. Cleanup fixture untuk development

Contract admin saat ini tidak menyediakan delete admin user maupun delete store product. Event memiliki DELETE, tetapi semantiknya archive dan bukan hard delete. Untuk E2E berulang mohon sediakan salah satu:

- endpoint cleanup khusus development;
- reset/seed fixture yang idempotent;
- command backend untuk menghapus fixture berdasarkan prefix.

Fixture event/publisher yang dibuat pada retest terbaru sudah diminta untuk dibersihkan oleh pemilik backend:

- username `E2E_EVENTS_publisher_20260909222340` (backend id `14`);
- event dengan code prefix `E2E_EVENTS_` yang dibuat selama rangkaian retest.

Command cleanup yang dijalankan:

```sh
go run ./cmd/cleanup-fixtures --prefix E2E_EVENTS_
```

Status cleanup: **reported complete by user**. Verifikasi langsung belum dilakukan karena backend tidak sedang listen saat pengecekan terakhir.

Riwayat pengurus `B1800110` sudah di-release dan tidak memiliki assignment aktif; riwayat tersebut tidak mengganggu state operasional.

## 6. Stabilitas runtime

Pada beberapa percobaan frontend dev server, backend sempat mengembalikan `ERR_CONNECTION_REFUSED` pada port 4054, lalu kembali normal tanpa perubahan frontend. Mohon cek process supervisor/dev server lifecycle dan pastikan backend tetap listen pada `localhost` serta `127.0.0.1` selama sesi E2E.

## Status dampak ke gate

- Gate 4 API/mutation: lulus untuk sync, conflict, tariff, snapshot, assign, dan release. Temuan token diabaikan sesuai keputusan proyek.
- Gate 6.1: publish/unpublish enforcement dan cleanup prefix dilaporkan selesai; tersisa verifikasi browser mutation bila dijadikan syarat release.
- Gate 7: quality/browser suite frontend lulus; release readiness masih menunggu Store create/upload aktual, browser E2E mutation seluruh modul, keyboard/focus review, dan keputusan `knip`.
