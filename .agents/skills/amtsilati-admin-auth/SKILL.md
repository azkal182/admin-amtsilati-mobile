---
name: amtsilati-admin-auth
description: Implement Amtsilati admin JWT sessions, refresh, route guards, and RBAC UX.
---

# Amtsilati Admin Auth

Use this skill for login, refresh, logout, session-expired behavior, protected routes, forbidden states, or permission-based visibility.

## Required context

- Read `docs/amtsilati-frontend-plan/01-scope-and-rules.md`.
- Read the admin auth endpoints and schemas in `docs/api/openapi.yaml`.

## Rules

- Login uses `/internal/admin/auth/login` with `username` and `password`.
- Refresh uses `/internal/admin/auth/token/refresh`; attempt it at most once for a request that failed with 401.
- If refresh fails, clear local session state and navigate to login/session expired.
- Logout calls `/internal/admin/auth/logout` when possible and always clears local session state.
- Never use Clerk, user tokens, or mock tokens.
- Never send `X-Internal-Token`.
- Prefer secure deployment-managed cookie handling for refresh tokens on web; do not expose secrets through logs or analytics.
- Do not treat a 403 as an expired token. Render forbidden behavior and do not retry it.
- Do not trust unverified JWT permission claims as the final authorization decision.
- Since the current profile endpoint does not provide dynamic permissions, keep capability configuration explicit and treat backend 403 as authoritative.

## Verification

Verify successful login, invalid credentials, protected-route redirect, one-time refresh, refresh failure, logout cleanup, and forbidden behavior. Ensure redirect URLs cannot create an unintended open redirect.
