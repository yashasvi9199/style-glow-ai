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


