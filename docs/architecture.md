# Architecture

## Stack
- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Supabase Auth
- Supabase Postgres + RLS
- Supabase Storage
- Prisma (legacy read-only migration tool)

## Folder Tree
```text
app/
  (public)/
    page.tsx
    pricing/page.tsx
    _components/
  (auth)/
    login/
    register/
    forgot-password/
    reset-password/
    _actions/
    _components/
  (dashboard)/
    dashboard/
      templates/
      setup/
      media/
      guests/
      preview/
      send/
      rsvp/
      analytics/
      settings/
      _actions/
      _components/
      _config/
  (admin)/
    admin/
      users/
      invitations/
      templates/
      payments/
      send-logs/
      settings/
      _actions/
      _components/
      _config/
  [coupleSlug]/
    [guestSlug]/
      page.tsx
      not-found.tsx
      opengraph-image.tsx
      _actions/
  api/
    guests/import/
    uploads/
  auth/
    callback/
  layout.tsx
  sitemap.ts
  robots.ts
  opengraph-image.tsx
proxy.ts

components/
  ui/

features/
  auth/
  guest/
  invitation/
    templates/
  rsvp/
  settings/

lib/
  auth/
  constants/
  db/
  supabase/
  utils/

prisma/
  schema.prisma
  manual-postgresql.sql
  manual-postgresql-role-update.sql

supabase/
  migrations/

docs/
tests/
```

## Responsibility Split
- `app/(public)`: marketing pages
- `app/(auth)`: login/register/recovery flow
- `app/(dashboard)`: client workspace
- `app/(admin)`: admin-only pages
- `app/[coupleSlug]/[guestSlug]`: public invitation route
- `app/api`: upload/import/auth endpoints
- `features/*`: domain modules, schema, services, presentational pieces
- `lib/*`: shared constants, guards, db client, low-level utils

## Naming
- Route pages: `page.tsx`
- Route layout: `layout.tsx`
- Route-specific components: `_components/*`
- Route-specific server actions: `_actions/*`
- Domain services: `*.service.ts`
- Validation schema: `*.schema.ts`
- Shared constants: `lib/constants/*`

## MVP Principles
- mobile-first
- server-first by default
- client components only for interaction-heavy UI
- single invitation per client account for current MVP
- admin separated by route group and role guard
