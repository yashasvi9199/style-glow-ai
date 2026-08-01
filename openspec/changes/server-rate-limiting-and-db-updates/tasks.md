## 1. Rate Limiting Middleware

- [x] 1.1 Create middleware at `functions/api/_middleware.ts` to implement rate limiting logic using Cloudflare D1 `rate_limits` table.
- [x] 1.2 Implement IP checking and incrementing logic in the middleware with a 3-minute rate limit window and a max of 1 request.

## 2. API Logging & Configuration Updates

- [ ] 2.1 Update `functions/api/analyze.ts` to expect `imageUrl` in the request body.
- [ ] 2.2 Update `functions/api/analyze.ts` D1 database logging statement to insert `imageUrl` into the `image_url` column.
- [ ] 2.3 Fix the user ID mapping in `functions/api/analyze.ts` by hashing the request's IP and User Agent to generate a reliable anonymous `user_id`.
- [ ] 2.4 Update the default Gemini model configuration inside `functions/api/analyze.ts` to `gemini-3.6-flash`.

## 3. Frontend Service Updates

- [ ] 3.1 Modify `src/domains/analysis/services/aiService.ts` to await `uploadToCloudinary` first.
- [ ] 3.2 Update `aiService.ts` to pass the resulting Cloudinary URL as `imageUrl` to `/api/analyze`.
- [ ] 3.3 Update the frontend fallback model configuration in `aiService.ts` to request `gemini-3.6-flash`.
