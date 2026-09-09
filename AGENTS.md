# Amtsilati Admin Frontend Agent Guide

## Project identity

This repository contains the Amtsilati internal admin frontend. The product language and visual branding must use **Amtsilati**, not the original Shadcn Admin or Clerk template identity.

The development API origin is `http://localhost:4054` and the API prefix is `/api/v1`.

## Operating rules

- Read the relevant project skill before making a change.
- Read `docs/amtsilati-frontend-plan/README.md` and the linked phase document when the task changes architecture, scope, or a module.
- Treat `docs/api/openapi.yaml` as the API contract. Do not invent endpoints, fields, response shapes, or permissions.
- This frontend uses the admin boundary only: `/internal/admin/*` plus `/health` where needed.
- Never mix admin JWT with user/client authentication.
- Do not send or expose `X-Internal-Token`; admin access is authenticated with JWT.
- Do not access PostgreSQL, MySQL, or any database directly from the browser.
- Preserve unrelated user changes. Do not reset or delete files without explicit scope.
- Keep route files thin and keep domain behavior inside the owning feature.
- Every page must handle the relevant loading, empty, success, validation, forbidden, not-found, conflict, and server-error states.
- Use Bun, matching `bun.lock` and the `packageManager` field, for project commands. Run proportional verification after changes. At minimum use `bun run lint` and `bun run build` for source changes; run targeted tests when behavior changes.

## Skill routing

Use the smallest relevant skill set:

- `.agents/skills/amtsilati-frontend-architecture/SKILL.md` — folder structure, routes, cleanup, shared components, and branding.
- `.agents/skills/amtsilati-admin-api/SKILL.md` — OpenAPI mapping, admin client, envelope parsing, errors, pagination, and uploads.
- `.agents/skills/amtsilati-admin-auth/SKILL.md` — admin JWT, refresh, logout, route guards, and permission UX.
- `.agents/skills/amtsilati-admin-modules/SKILL.md` — implementation of Admin Users, Students, Syahriyah, Store, and Calendar Events.
- `.agents/skills/amtsilati-frontend-quality/SKILL.md` — tests, accessibility, responsive behavior, security checks, and phase gates.

For a cross-cutting task, load the relevant skills in this order: architecture, API/auth, domain module, then quality.

## Phase discipline

Follow the phase checklist and gate in `docs/amtsilati-frontend-plan/03-phases-and-gates.md`. Do not silently skip a gate. If a contract or deployment assumption is missing, record it as a blocker or explicit assumption before implementation.
