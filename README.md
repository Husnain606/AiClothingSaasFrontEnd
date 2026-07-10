# FashionSaaS Storefront

Angular 21 (standalone components, zoneless change detection) customer-facing storefront for the FashionSaaS platform — Phase 3 of the FashionSaaS build. Generated with Angular CLI 21.1.2, tested with Vitest via `ng test`.

## Prerequisites

- Node.js 20+ and npm 11+ (`packageManager` pinned to `npm@11.17.0`)
- FashionSaaS Phase 2 backend API reachable at the URL configured in `src/environments/environment.ts` (defaults to `http://localhost:5000/api/v1`)

Install dependencies:

```bash
npm install
```

## Development server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The app reloads automatically on source changes. Uses `environment.ts` (development config, `production: false`).

## Running unit tests

```bash
npm test        # watch mode (Vitest)
npm run test:ci # single run, no watch — use in CI
```

Current suite: 828/828 tests passing.

## Production build

```bash
npm run build:prod
```

Equivalent to `ng build --configuration production`. This:

- Applies `fileReplacements` to swap in `src/environments/environment.prod.ts`
- Enables output hashing on all emitted files (safe for long-lived caching)
- Disables source maps
- Enforces bundle budgets (see below)

Build output is written to `dist/fashionsaas-storefront/browser`.

`npm run build` (no configuration flag) also defaults to the production configuration per `angular.json` (`defaultConfiguration: production`).

### Bundle budgets

The initial bundle for this app sits at ~593 kB (raw), dominated by the Angular/RxJS runtime (~360 kB JS) plus the full Bootstrap 5 stylesheet (~232 kB CSS, used across effectively every component). All feature routes (catalog, cart, checkout, account, auth) are already lazy-loaded via `loadComponent` in `app.routes.ts`, and the shared header/footer only pull in models/services, not feature components — so there is no accidental eager-loading to fix here. The `initial` budget in `angular.json` is therefore set to a justified `600kB` warning / `1MB` error (raised from the Angular CLI default of `500kB`/`1MB`) to reflect this legitimate baseline rather than suppressing a real regression signal. Component style budgets remain at the CLI defaults (`4kB` warning / `8kB` error).

### Bundle analysis

```bash
npm run analyze
```

Runs a production build with `--stats-json`, emitting `dist/fashionsaas-storefront/stats.json` for use with a bundle visualizer (e.g. `npx webpack-bundle-analyzer dist/fashionsaas-storefront/stats.json`) if deeper investigation is needed later.

## Environment configuration

| Property | `environment.ts` (dev) | `environment.prod.ts` (production) |
|---|---|---|
| `production` | `false` | `true` |
| `apiBaseUrl` | `http://localhost:5000/api` | `https://api.fashionsaas.com/api` |
| `tenantSlug` | `'default-tenant'` (placeholder) | `''` (resolved at runtime) |

`angular.json`'s `production` build configuration wires `fileReplacements` so any `import { environment } from './environments/environment'` resolves to `environment.prod.ts` in production builds.

## Route map

| Path | Layout | Component | Guards |
|---|---|---|---|
| `/` | Main | redirects to `/products` | — |
| `/products` | Main | `CatalogComponent` | `authGuard` |
| `/products/:id` | Main | `ProductDetailComponent` | `authGuard` |
| `/cart` | Main | `CartComponent` | `authGuard` |
| `/checkout` | Main | `CheckoutComponent` | `authGuard`, `cartNotEmptyGuard` |
| `/account` | Main | `AccountComponent` | `authGuard` |
| `/login` | Auth | `LoginComponent` | — |
| `/register` | Auth | `RegisterComponent` | — |
| `**` | — | `NotFoundComponent` | — |

All feature routes are lazy-loaded (`loadComponent`).

## Admin area routes

The `/admin` subtree (Phase 4b) is a role-routed back-office area, entirely lazy-loaded off the main app shell. Every top-level section below is its own lazy chunk; nothing under `/admin` is part of the initial bundle.

| Path | Guard(s) | Roles |
| --- | --- | --- |
| `/admin` | `adminRoleGuard` | `AdminOwner`, `StoreManager`, `InventoryManager`, `OrderManager`, `ContentManager`, `SuperAdmin` |
| `/admin/orders` | `adminRoleGuard` | `AdminOwner`, `OrderManager`, `StoreManager` |
| `/admin/catalog` | `adminRoleGuard` | `AdminOwner`, `StoreManager`, `ContentManager` |
| `/admin/inventory` | `adminRoleGuard` | `AdminOwner`, `InventoryManager` |
| `/admin/customers` | `adminRoleGuard` | `AdminOwner`, `StoreManager` |
| `/admin/discounts` | `adminRoleGuard` | `AdminOwner`, `StoreManager` |
| `/admin/reviews` | `adminRoleGuard` | `AdminOwner`, `StoreManager` |
| `/admin/reports` | `adminRoleGuard` | `AdminOwner`, `StoreManager` |
| `/admin/settings` | `adminRoleGuard` + `adminOwnerGuard` | `AdminOwner` |
| `/admin/platform` | `adminRoleGuard` + `superAdminGuard` | `SuperAdmin` |

### Platform console (`/admin/platform`)

SuperAdmin-only console over the existing `api/admin/*` backend endpoints — no new backend was required for this area.

| Path | Purpose |
| --- | --- |
| `/admin/platform` | KPI overview (tenant/subscription/user counts assembled client-side) |
| `/admin/platform/tenants` | Tenant list, create, detail, suspend/activate, delete (typed-confirmation) |
| `/admin/platform/plans` | Subscription plan CRUD |
| `/admin/platform/subscriptions` | Assign/change-plan/suspend/reactivate tenant subscriptions |
| `/admin/platform/payments` | Payments scoped by subscription ID, confirm pending payments |
| `/admin/platform/users` | Platform (SuperAdmin) user list + unlock |
| `/admin/platform/security/audit-logs` | Audit log table with date-range filter |
| `/admin/platform/security/login-attempts` | Login attempt table with email filter |
| `/admin/platform/security/mfa-setup` | TOTP QR-code setup + verification flow |
| `/admin/platform/security/bank-account` | Masked platform bank account view |

## Deployment note

This repo produces a static SPA build only — no Docker image or cloud deployment pipeline is included here. Since routing is entirely client-side (Angular Router), any static host must rewrite unmatched paths to `index.html` so deep links and hard refreshes work.

A reference nginx configuration with SPA fallback (`try_files ... /index.html`), gzip, and immutable caching for hashed JS/CSS assets is provided at [`deploy/nginx.conf`](./deploy/nginx.conf). It is documentation only — full containerized/cloud deployment (Docker image, Azure hosting, CI/CD) is **Phase 8** scope.

## Additional resources

- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [Vitest](https://vitest.dev/)
