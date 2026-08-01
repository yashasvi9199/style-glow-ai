## Why

We need to implement server-side rate limiting to prevent API abuse, capture Cloudinary image URLs in the database for better analysis logging, fix the incorrect enum mapping logic, and upgrade the default Gemini model configuration to 3.6-flash.

## What Changes

- **Server-Side Rate Limiting**: Introduce middleware utilizing the D1 database (`rate_limits` table) to track and restrict API request frequency based on IP address.
- **Model Configuration Update**: Update the default model configuration in the analysis handler to use `gemini-3.6-flash`.
- **Database Image URL Logging**: Extend database logging to capture the Cloudinary image URL in the `analysis_logs` table.
- **Enum Mapping Fix**: Resolve the incorrect mapping of `user_id` to the confidence enum (`parsedResult.e?.conf`).

## Capabilities

### New Capabilities
- `rate-limiting`: Restrict request frequency per IP using D1 database tracking.
- `image-logging`: Capture and log uploaded image URLs into D1 analysis logs.

### Modified Capabilities

## Impact

- **Database**: D1 Database (`rate_limits` and `analysis_logs` tables).
- **API routes**: `/functions/api/analyze.ts` (upgraded model configuration, logging schema correction).
- **Middleware**: A new request middleware for Pages Functions to rate limit requests.
