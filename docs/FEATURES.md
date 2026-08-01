# Completed Features Pointers

- [Cloudflare Pages Handlers](./GUIDE.md#cloudflare-pages-setup): Serverless API endpoints migrated from Vercel to Cloudflare Pages Functions.
- [Cloudflare D1 Database Setup](./GUIDE.md#cloudflare-d1-database-integration): Integration with Cloudflare D1 SQL database using standard SQLite queries.
- [D1 Schema Definition](./DATABASE.sql): The append-only historical database schema for the analysis logs.
- [Server-Side D1 Rate Limiting](./changes/server-rate-limiting-and-db-updates/design.md): Server-side rate limiting middleware at `functions/api/_middleware.ts` restricting POST requests to `/api/analyze` based on IP address.
- [Cloudinary Image Logging](./changes/server-rate-limiting-and-db-updates/design.md): Logs uploaded Cloudinary image URLs in the D1 `analysis_logs` table.

