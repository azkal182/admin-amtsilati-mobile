# Amtsilati Admin

Panel administrasi internal Amtsilati berbasis React, TypeScript, TanStack Router, TanStack Query, dan shadcn/ui.

## Development

```bash
bun install
bun run dev
```

Frontend menggunakan API development berikut:

```env
VITE_API_BASE_URL=http://localhost:4054
VITE_API_PREFIX=/api/v1
VITE_APP_ENV=development
```

## Struktur dan aturan

- `src/routes/` berisi definisi route yang tipis.
- `src/features/` berisi domain feature.
- `src/components/ui/` berisi komponen UI generik.
- `src/api/` disiapkan untuk API client admin.
- `docs/api/openapi.yaml` adalah kontrak API.
- `docs/amtsilati-frontend-plan/` berisi scope, fase, checklist, dan gate.
- `.agents/skills/` berisi skill project-specific untuk menjaga konsistensi pengembangan.

## Commands

```bash
bun run lint
bun run build
bun run test
```

Implementasi dilakukan bertahap sesuai [planning](docs/amtsilati-frontend-plan/README.md). Modul Payments sudah memiliki route dan UX foundation; verifikasi runtime backend tetap mengikuti gate fase terkait.
