---
name: amtsilati-frontend-architecture
description: Maintain Amtsilati frontend structure, routing, cleanup, and branding.
---

# Amtsilati Frontend Architecture

Use this skill when adding routes, reorganizing files, removing template code, changing the application shell, or deciding whether code belongs in a feature, shared layer, or UI primitive.

## Required context

- Read `AGENTS.md`.
- Read `docs/amtsilati-frontend-plan/02-architecture.md`.
- Read the relevant phase in `docs/amtsilati-frontend-plan/03-phases-and-gates.md`.

## Rules

- Keep route files thin: route definition, search validation, guard metadata, and page entry only.
- Keep domain code inside `src/features/<feature>`.
- Keep generic shadcn/Radix components free of Amtsilati business rules.
- Put genuinely cross-feature utilities in `shared`, not domain-specific helpers.
- Remove demo/template code only after checking imports, routes, tests, assets, and dependencies.
- Use Amtsilati copy, title, metadata, logo, favicon, and navigation labels consistently.
- Do not introduce Clerk or user/client API code into the admin application.
- Preserve TanStack Router generated files as generated output; update source routes and regenerate through the normal project workflow.

## Change workflow

1. Inspect current imports and route references before moving or deleting files.
2. Map the change to the target folder structure.
3. Make the smallest coherent change; avoid unrelated refactors.
4. Check for stale imports, dead routes, template branding, and unused dependencies.
5. Run the architecture-relevant lint/build checks and report any generated-file requirement.
