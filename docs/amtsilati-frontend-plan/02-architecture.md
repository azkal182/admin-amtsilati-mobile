# Arsitektur dan Struktur Folder

## 1. Prinsip

- Route hanya mengatur URL, guard, search schema, dan entry point halaman.
- Feature memiliki UI, query/mutation hooks, schema form, dan domain mapping miliknya sendiri.
- API layer tidak berisi komponen UI.
- Shared berisi utilitas yang benar-benar lintas feature, bukan tempat menaruh semua kode.
- Komponen shadcn/Radix tetap generik dan tidak mengetahui domain Amtsilati.

## 2. Struktur target

```text
src/
  app/
    providers/
    router/
    layouts/
  api/
    admin-client.ts
    auth-client.ts
    envelope.ts
    error-mapper.ts
    types.ts
  features/
    auth/
    dashboard/
    admin-users/
    students/
    syahriyah/
    store/
    calendar-events/
  components/
    ui/
    data-table/
    feedback/
    layout/
  shared/
    constants/
    formatters/
    validators/
  stores/
  hooks/
  lib/
  routes/
  styles/
```

## 3. Kontrak feature

Setiap feature yang memiliki API minimal mempunyai:

```text
features/<feature>/
  api.ts              # request/query/mutation feature
  types.ts            # tipe domain feature
  schemas.ts          # validasi form/query
  components/         # komponen khusus feature
  pages/              # composition halaman
  index.ts            # public exports feature
```

Feature sederhana boleh menggabungkan file, tetapi tidak boleh memindahkan kode domain ke `components/ui`, `lib`, atau `shared` hanya demi mengurangi jumlah file.

## 4. API client

- `admin-client.ts` memiliki base URL, prefix, bearer admin JWT, envelope parser, request ID, dan refresh interceptor.
- `auth-client.ts` hanya menangani login, refresh, dan logout admin.
- Error mapper memetakan 400, 401, 403, 404, 409, 429, dan 500 ke error UI terstruktur.
- `X-Internal-Token` tidak menjadi konfigurasi frontend.
- `clientApi` user tidak dibuat di project ini kecuali scope berubah secara eksplisit.

## 5. Route map target

```text
/login
/session-expired
/forbidden
/
/admin-users
/students
/students/$idSantri
/syahriyah
/syahriyah/tariffs
/syahriyah/snapshots
/syahriyah/pengurus
/store/products
/store/products/new
/store/products/$id
/events
/events/new
/events/$id
/settings
```

Penamaan URL boleh disesuaikan selama tetap konsisten dan tidak mengubah API contract.
