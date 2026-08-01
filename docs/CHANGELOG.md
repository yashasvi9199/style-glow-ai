## [1.5.0] - 2026-08-01

### Added
- Implemented Cloudflare Pages Functions server-side rate limiting middleware at `functions/api/_middleware.ts` restricting POST requests per IP to `/api/analyze` using the `rate_limits` D1 database table.
- Added database image URL logging to save the uploaded Cloudinary URL in the `image_url` column in the `analysis_logs` table.

### Changed
- Configured default model configuration in frontend and backend to use `gemini-3.6-flash`.
- Updated client-side image analyze service flow to await the Cloudinary upload sequentially and pass the resulting URL as `imageUrl` to the backend.

### Fixed
- Resolved the incorrect user ID mapping that originally saved the confidence enum value in `user_id` instead of a unique anonymous ID hash.

## [1.4.3] - 2026-08-01

### Added
- Created [ModelViewer](file:///home/milanz/Programming/style-glow-ai/src/domains/shared/components/ModelViewer.tsx) component to fetch and display available models using the user's `GEMINI_API_KEY` stored in Cloudflare environment variables.
- Added a "Gemini Models" button to the top-right header on the main upload page.

### Fixed
- Cleaned up unnecessary `import.meta.env.VITE_API_URL` fallback checks and directly hardcoded `/api/analyze` and `/api/config` relative routes.
- Completely removed CORS, Origin, and Referer validation headers/restrictions from backend endpoints since both frontend and backend share the same Cloudflare Pages deployment origin, resolving 403 Forbidden errors.

## [1.4.2] - 2026-08-01

### Changed
- Replaced the fallback Vercel API URLs (`style-glow-api.vercel.app`) in `aiService.ts` and `storageService.ts` with relative routes (`/api/analyze` and `/api/config`) to ensure the application runs fully standalone on Cloudflare Pages.

## [1.4.1] - 2026-08-01

### Fixed
- Upgraded `@vitejs/plugin-react` to `^6.0.5` to resolve a peer dependency conflict with `vite@8.2.0`, allowing standard `npm install` to succeed without flags.

## [1.4.0] - 2026-08-01

### Added
- Integrated Cloudflare Pages Functions in the `functions/` directory, merging backend functionality directly into the frontend repository.
- Migrated API endpoints (`analyze`, `config`, `models`) to standard Web APIs supported by Cloudflare Workers runtime.
- Added optional database logging utilizing Cloudflare D1 SQLite database.
- Added Cloudflare D1 SQL schema configuration in `docs/DATABASE.sql`.
- Added Wrangler CLI to project's devDependencies to ease local development and testing of Pages Functions.


