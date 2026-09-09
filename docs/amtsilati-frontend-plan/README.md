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

- [ ] Fase 0 — Audit dan cleanup template
- [ ] Fase 1 — Foundation, API client, dan application shell
- [ ] Fase 2 — Admin authentication dan session lifecycle
- [ ] Fase 3 — Admin Users dan Students
- [ ] Fase 4 — Syahriyah Operations
- [ ] Fase 5 — Store Management
- [ ] Fase 6 — Calendar Events
- [ ] Fase 7 — Hardening, testing, dan release readiness

Fase berikutnya tidak dimulai sebelum gate fase sebelumnya berstatus lulus.
