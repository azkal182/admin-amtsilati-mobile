# Checklist Implementasi Frontend Internal

## Fondasi

- [ ] API client admin terpisah dari client user.
- [ ] Base URL dan environment tidak hardcode.
- [ ] Request otomatis memiliki `Authorization` untuk endpoint protected.
- [ ] Request ID dari response disimpan pada error telemetry.
- [ ] Global handler untuk 401, 403, 404, 409, 429, dan 500.
- [ ] Semua response diparse melalui envelope standar.

## Session dan keamanan

- [ ] Access token tidak ditulis ke log.
- [ ] Password dan refresh token tidak muncul di analytics/error tracker.
- [ ] Refresh hanya dicoba sekali per request gagal.
- [ ] Logout membersihkan session lokal walaupun request logout gagal.
- [ ] UI permission bukan satu-satunya authorization boundary.

## Modul aktif

- [ ] Login/session expired/forbidden.
- [ ] Admin users.
- [ ] Student helper.
- [ ] Syahriyah sync, tariff, snapshot, pengurus.
- [ ] Store products, signed upload, dan soft delete.
- [ ] Calendar events: list/detail/create/edit/archive dengan permission `events.manage`.
- [ ] Validasi aksi publish/unpublish dengan permission `events.publish`.
- [ ] Loading, empty, error, dan success state pada setiap halaman.
- [ ] Pagination server-side dan query state tersimpan di URL bila sesuai.

## Contract discipline

- [ ] Tipe dihasilkan/divalidasi dari `api/openapi.yaml`.
- [ ] Tidak membuat endpoint frontend yang tidak ada di OpenAPI.
- [ ] Domain content dan calendar adjustment tetap feature-flagged sampai API tersedia; event kalender sudah tersedia melalui katalog API.
- [ ] Perubahan kontrak API disinkronkan ke OpenAPI dan guide ini.
