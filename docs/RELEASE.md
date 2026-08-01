## [1.4.2] - 2026-08-01
### Standalone Cloudflare Pages API Fallbacks
- Replaced fallback Vercel API URLs with relative pathways `/api/analyze` and `/api/config` to ensure full independence from external Vercel APIs.

## [1.4.1] - 2026-08-01
### Fix Dependency Conflict with Vite 8
- Upgraded `@vitejs/plugin-react` to `^6.0.5` to resolve the peer dependency mismatch with `vite@8.2.0`, allowing standard `npm install` without flags.

## [1.4.0] - 2026-08-01
### Cloudflare Pages & D1 Database Migration
- Merged API repository into frontend repository.
- Migrated code to Pages Functions.
- Added Wrangler emulation script.
- Configured Cloudflare D1 DB schema and client-side setup.
