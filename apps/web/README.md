# Web App (`apps/web`)

Next.js App Router frontend for the UslugPOL panel.

## Development

From the monorepo root:

```bash
npm run dev --workspace web
```

App URL: `http://localhost:4000`

## Clerk Authentication Setup

This app now uses Clerk for login/session handling and RBAC checks.

1. Add environment variables (for local development):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

2. In Clerk Dashboard, configure Session token claims so app role data is present in JWT claims.  
Recommended custom claim:

```json
{
  "metadata": "{{user.public_metadata}}"
}
```

3. Set each user's `public_metadata.role` to one of:

- `admin`
- `core_operator`
- `event_operator`
- `car_operator`
- `viewer`

If no valid role is present, the app falls back to `viewer`.

## Auth Routes

- `/sign-in`
- `/sign-up`
- `/forbidden`

Protected routes are enforced by Clerk proxy middleware + server-side permission checks.
