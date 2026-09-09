# Amtsilati Admin Frontend Plan

Dokumentasi ini adalah rencana kerja utama untuk membangun panel admin Amtsilati dari template React yang tersedia.

## Dokumen

- [Scope dan aturan proyek](./01-scope-and-rules.md)
- [Arsitektur dan struktur folder](./02-architecture.md)
- [Fase implementasi dan gate](./03-phases-and-gates.md)
- [Definition of done dan traceability](./04-definition-of-done.md)

## Keputusan proyek

| Item | Keputusan |
|---|---|
| Branding | Amtsilati |
| Environment development | `http://localhost:4054` |
| API prefix | `/api/v1` |
| Authentication | Admin JWT dari `/internal/admin/auth/*` |
| `X-Internal-Token` | Tidak digunakan oleh frontend admin |
| API source of truth | [`docs/api/openapi.yaml`](../api/openapi.yaml) |
| Database access | Tidak boleh dilakukan dari browser |
| Implementasi | Bertahap; setiap fase harus melewati gate |

## Status fase

- [x] Fase 0 — Audit dan cleanup template
- [x] Fase 1 — Foundation, API client, dan application shell
- [x] Fase 2 — Admin authentication dan session lifecycle
- [ ] Fase 3 — Admin Users dan Students (implementasi selesai; Gate 3 pending)
- [ ] Fase 4 — Syahriyah Operations (implementasi selesai; Gate 4 pending)
- [ ] Fase 5 — Store Management
- [ ] Fase 6 — Calendar Events
- [ ] Fase 7 — Hardening, testing, dan release readiness

Fase 2 sudah diimplementasikan, diuji dengan unit test, dan diverifikasi melalui browser pada `http://localhost:5173` menggunakan backend `http://localhost:4054`. Flow yang terverifikasi mencakup protected redirect, login sukses, pemulihan session setelah navigasi ulang, logout dan cleanup, kredensial invalid, 403, serta session expired. Chromium Playwright belum tersedia di environment, sehingga verifikasi browser menggunakan In-app Browser.

Fase berikutnya tidak dimulai sebelum gate fase sebelumnya berstatus lulus.
