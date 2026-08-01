## [1.5.0] - 2026-08-01
### Server Rate Limiting & D1 Database Logging Updates
- Implemented server-side rate limiting middleware per client IP using the `rate_limits` table in Cloudflare D1.
- Updated default configuration to request and run `gemini-3.6-flash`.
- Sequentially awaited and logged Cloudinary uploaded image URLs into the `image_url` column in the D1 `analysis_logs` table.
- Fixed the incorrect user ID mapping that logged the confidence enum.

## [1.4.3] - 2026-08-01
### Add Gemini Model Viewer
- Fetched and displayed available models using the user's `GEMINI_API_KEY` stored in Cloudflare environment variables.
- Added a "Gemini Models" button to the top-right header on the main upload page.

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
