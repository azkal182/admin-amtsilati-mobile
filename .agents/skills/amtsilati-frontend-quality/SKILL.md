---
name: amtsilati-frontend-quality
description: Verify Amtsilati frontend tests, UI states, accessibility, security, and gates.
---

# Amtsilati Frontend Quality

Use this skill after implementing a feature, when reviewing a phase gate, or when hardening the frontend for release.

## Required context

- Read the relevant gate in `docs/amtsilati-frontend-plan/03-phases-and-gates.md`.
- Read `docs/amtsilati-frontend-plan/04-definition-of-done.md`.

## Verification checklist

- Run `bun run lint` and `bun run build` for source changes.
- Run targeted tests for changed API, auth, form, route, polling, upload, and permission behavior.
- Check loading, empty, success, validation, forbidden, not-found, conflict, network, and server-error states.
- Check keyboard navigation, focus visibility, labels, table semantics, contrast, and responsive layouts.
- Confirm no Clerk, demo route, mock business data, hardcoded API origin, `X-Internal-Token`, password, JWT, refresh token, or API secret appears in the changed production path.
- Confirm mutations invalidate or refresh affected queries and polling is cleaned up.
- Confirm OpenAPI endpoint, request, response, status handling, and permission mapping are traceable.

## Gate decision

Report a gate as **pass** only when all required checklist items are verified. Report **blocked** when a missing backend contract, unavailable environment, or failing prerequisite prevents meaningful verification. Include the exact failed check and the smallest next action.
