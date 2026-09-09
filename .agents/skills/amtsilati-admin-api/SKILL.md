---
name: amtsilati-admin-api
description: Integrate Amtsilati admin frontend behavior with the OpenAPI contract.
---

# Amtsilati Admin API

Use this skill for API clients, query/mutation hooks, response types, error handling, pagination, polling, or signed uploads.

## Required context

- Read `docs/api/openapi.yaml` for the exact endpoint and schema.
- Read `docs/amtsilati-frontend-plan/01-scope-and-rules.md` for the allowed API boundary.

## Rules

- Use `VITE_API_BASE_URL` with development default `http://localhost:4054` and `VITE_API_PREFIX=/api/v1`; never hardcode an origin in feature code.
- Use only `/internal/admin/*` for admin operations and `/health` for health status.
- Keep admin API and any future user/client API clients separate.
- Parse the standard success/error envelope centrally. `data` may be an array, object, or null.
- Preserve pagination fields: `total_records`, `current_page`, `total_pages`, `next_page`, and `prev_page`.
- Map 400, 401, 403, 404, 409, 429, and 500 into typed UI-facing errors.
- Preserve `meta.requestId` on errors; never log tokens, passwords, or secret upload material.
- Do not add `X-Internal-Token`; admin JWT is the authentication mechanism.
- Do not retry 403, 404, 409, or validation errors. Refresh handling for 401 belongs to the auth skill and must be bounded.
- Signed upload uses the server-provided upload parameters. Never generate a Cloudinary signature or expose `apiSecret` in the browser.

## Workflow

1. Locate the exact OpenAPI path and referenced request/response schemas.
2. Define or update typed mapping close to the owning feature.
3. Implement the request through the shared admin client.
4. Add query keys and invalidation rules for affected data.
5. Cover contract errors and request ID behavior with tests where practical.
