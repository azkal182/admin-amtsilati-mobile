# Katalog API Internal

Base URL: `/api/v1`. Semua path di bawah ditulis relatif terhadap base URL.

## 1. Auth admin

| Method | Path | Auth | Response utama |
|---|---|---|---|
| POST | `/internal/admin/auth/login` | none | `AdminLoginResponse` |
| POST | `/internal/admin/auth/token/refresh` | none + refresh token | `RefreshTokenResponse` |
| POST | `/internal/admin/auth/logout` | optional | `LogoutResponse` |

## 2. Admin users — `users.manage`

| Method | Path | Query/body |
|---|---|---|
| GET | `/internal/admin/users` | `page`, `limit`, `search` |
| POST | `/internal/admin/users` | `CreateAdminUserRequest` |
| GET | `/internal/admin/users/me` | - |
| PATCH | `/internal/admin/users/{id}` | `UpdateAdminUserRequest` |
| PATCH | `/internal/admin/users/{id}/password` | `UpdateAdminPasswordRequest` |
| GET | `/internal/admin/users/{id}/access` | user ID; role dan permission efektif |
| POST | `/internal/admin/users/{id}/roles` | `{ "roleCode": "event_editor" }` |
| DELETE | `/internal/admin/users/{id}/roles/{roleCode}` | user ID dan role code |

Katalog akses:

| Method | Path | Permission |
|---|---|---|
| GET | `/internal/admin/roles` | `users.manage` |
| GET | `/internal/admin/permissions` | `users.manage` |

## 3. Student helper — `students.read`

| Method | Path | Query |
|---|---|---|
| GET | `/internal/admin/students` | `page`, `limit`, `search`, `status` |
| GET | `/internal/admin/students/{idSantri}` | - |

Response `AdminStudent` menggunakan casing legacy (`IDSantri`, `NIS`, `Nama`, `Alamat`, `Status`) dan mengikuti schema OpenAPI yang sama. Jangan mengasumsikan field lower camel case pada endpoint admin student.

## 4. Syahriyah — `syahriyah.manage`

| Method | Path | Query/body |
|---|---|---|
| POST | `/internal/admin/syahriyah/sync/students` | trigger async |
| GET | `/internal/admin/syahriyah/sync/students/status` | - |
| GET | `/internal/admin/syahriyah/tariffs` | `hijriPeriod`, `limit` |
| POST | `/internal/admin/syahriyah/tariffs` | `UpsertTariffRequest`; idempotent berdasarkan `hijriPeriod` + `category` |
| POST | `/internal/admin/syahriyah/snapshots/rebuild` | `SnapshotRebuildRequest` |
| GET | `/internal/admin/syahriyah/snapshots` | required `hijriPeriod` |
| GET | `/internal/admin/syahriyah/pengurus` | `idSantri`, `activeOnly`, `limit` |
| POST | `/internal/admin/syahriyah/pengurus/assign` | `AssignPengurusRequest` |
| POST | `/internal/admin/syahriyah/pengurus/release` | `ReleasePengurusRequest` |

## 5. Store — `store.manage`

| Method | Path | Query/body |
|---|---|---|
| GET | `/internal/admin/store/products` | `page`, `limit`, `search`, `available` |
| POST | `/internal/admin/store/products` | `AdminStoreProductUpsertRequest` |
| GET | `/internal/admin/store/products/{id}` | - |
| PATCH | `/internal/admin/store/products/{id}` | `AdminStoreProductUpsertRequest` |
| DELETE | `/internal/admin/store/products/{id}` | soft delete; `store.manage` |
| POST | `/internal/admin/store/uploads/sign` | - |

## 6. Calendar events — `events.manage`

| Method | Path | Query/body |
|---|---|---|
| GET | `/calendar/events` | `scope`, `category`, `fromGregorian`, `toGregorian`, `fromHijriYear`, `toHijriYear`, `includeRecurring` |
| GET | `/internal/admin/events` | `page`, `limit`, `scope`, `category`, `status` |
| POST | `/internal/admin/events` | `CalendarEventRequest`; `events.manage` |
| GET | `/internal/admin/events/{id}` | UUID; `events.manage` atau `events.publish` |
| PATCH | `/internal/admin/events/{id}` | `CalendarEventPatchRequest`, UUID; detail `events.manage`, status `DRAFT/PUBLISHED` `events.publish` |
| DELETE | `/internal/admin/events/{id}` | UUID; soft archive; `events.manage` |

Event admin menggunakan permission `events.manage` untuk operasi detail dan `events.publish` untuk publish/unpublish. Setiap mutasi diaudit. Public response menggunakan `data.items`, `data.count`, dataset `version`, serta dapat mengembalikan `304 Not Modified` dengan ETag.

Seed awal migration `000011_calendar_events_seed` menyediakan 21 event nasional: 10 event Masehi Indonesia dan 11 hari penting Islam berbasis Hijriah. Seed dapat dijalankan ulang dengan aman melalui `migrate up`.

## 6. Status code minimum

| Status | Frontend handling |
|---|---|
| 200 | Parse envelope dan render success |
| 400 | Tampilkan validation details |
| 401 | Refresh sekali atau logout |
| 403 | Forbidden state; jangan retry |
| 404 | Not-found state |
| 409 | Conflict form/global error |
| 429 | Backoff untuk signed upload |
| 500 | Generic error + request ID |

Kontrak detail parameter, response, dan schema selalu merujuk OpenAPI, bukan hanya tabel ringkas ini.
