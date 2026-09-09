---
name: amtsilati-admin-modules
description: Build consistent API-backed Amtsilati admin domain modules.
---

# Amtsilati Admin Modules

Use this skill when implementing or extending Admin Users, Students, Syahriyah, Store, or Calendar Events.

## Required context

- Read `docs/amtsilati-frontend-plan/03-phases-and-gates.md` for the module's phase checklist and gate.
- Read the relevant paths and schemas in `docs/api/openapi.yaml`.
- Read `docs/amtsilati-frontend-plan/04-definition-of-done.md` before declaring the module complete.

## Module rules

- Admin Users: support list/search/pagination, create, profile update, and password update; never display passwords.
- Students: support search/status/pagination and read-only detail; use a student picker for dependent flows.
- Syahriyah: use only `/internal/admin/syahriyah/*`; sync polling must stop on success, failure, timeout, or unmount; release pengurus requires confirmation.
- Store: validate non-negative price, `maxBuy >= 1`, and HTTPS image URL; signed upload precedes product save.
- Calendar Events: use UUID ids, support draft/published/archived states, archive through DELETE, and require `events.publish` for publish transitions.
- Do not implement content or calendar adjustment until an active API contract exists.
- Keep feature-specific types, schemas, query keys, components, and pages inside the feature boundary.
- Every mutation disables its submit control, reports success/error, and invalidates affected queries.
- Every list supports server-side pagination and appropriate URL query state.

## Implementation workflow

1. Identify the module phase and exact API contract.
2. Define query/mutation behavior and UI states before building components.
3. Implement the smallest complete vertical slice: route, page, API mapping, validation, feedback, and test.
4. Add permission visibility while retaining backend 403 handling.
5. Run the module checklist and document any contract ambiguity rather than inventing behavior.
