# Internal Frontend Guide

Panduan agnostik untuk membangun panel frontend internal SIDAFA. Dokumen ini tidak mengikat framework tertentu; contoh dapat diterapkan pada React, Vue, Angular, Svelte, Flutter Web, atau stack lain.

## Status panduan

- Sumber kontrak utama: [`api/openapi.yaml`](../api/openapi.yaml).
- Base path API: `/api/v1`.
- Panel internal menggunakan admin JWT dan endpoint `/internal/admin/*`.
- PostgreSQL internal adalah source of truth untuk data backoffice.
- MySQL legacy bukan target write frontend dan tidak boleh diakses langsung.
- Event, content, dan penyesuaian kalender Hijriyah belum memiliki endpoint aktif di API saat ini. Jangan membangun halaman mutasi untuk domain tersebut sebelum kontrak API tersedia.

## Daftar dokumen

1. [Setup, arsitektur, dan boundary](01-setup-and-architecture.md)
2. [Auth, RBAC, permission, dan audit](02-auth-rbac-and-audit.md)
3. [Halaman dan navigasi](03-pages-and-navigation.md)
4. [Katalog endpoint internal](04-internal-api-catalog.md)
5. [Schema, envelope, dan flow API](05-api-schemas-and-flows.md)
6. [Checklist implementasi frontend](06-frontend-implementation-checklist.md)

## Referensi terkait

- [Panduan auth dan envelope umum](../frontend-guide/01-auth-and-envelopes.md)
- [Flow admin lama](../frontend-guide/03-admin-app-flow.md)
- [OpenAPI YAML](../../api/openapi.yaml)
- Swagger UI saat server berjalan: `/api/v1/docs`
