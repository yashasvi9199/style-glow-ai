## Context

See proposal.md - Why.
We have an existing D1 database schema with `rate_limits` and `analysis_logs`. Currently, rate limiting is done purely client-side via `localStorage` checks, and the `image_url` column in `analysis_logs` remains empty because Cloudinary image URLs are uploaded asynchronously in the background from the client side without being sent to the `/api/analyze` endpoint. Additionally, `user_id` logging was mapped incorrectly to the confidence enum value instead of a unique user identifier.

## Goals / Non-Goals

**Goals:**
- Implement robust server-side rate limiting using Cloudflare D1.
- Upload image from the frontend first and pass the Cloudinary URL to the backend.
- Log the Cloudinary image URL in the database log.
- Generate a proper anonymous user ID from the request headers to replace the incorrect enum mapping.
- Update the default AI model to `gemini-3.6-flash`.

**Non-Goals:**
- Authenticating users using email/password (we will use anonymous IP hashing).
- Storing full raw images in the database.

## Decisions

### 1. Cloudflare Pages Middleware for Rate Limiting
- **Decision**: Create a Pages Functions middleware `functions/api/_middleware.ts` to intercept requests to `/api/analyze`.
- **Rationale**: Intercepting requests at the middleware level keeps the endpoint handler clean and ensures rate limiting logic is centralized.
- **Alternatives Considered**: Checking rate limits directly inside `analyze.ts`. This was rejected to keep endpoint concerns separated and support future middleware requirements.

### 2. Client-Side Flow for Image Logging
- **Decision**: Await the Cloudinary upload in `aiService.ts` before making the `/api/analyze` request, then pass the uploaded image URL as `imageUrl` in the JSON request body.
- **Rationale**: Allows the backend to log the actual hosted Cloudinary URL of the image, while still passing the base64 data for immediate Gemini processing.
- **Alternatives Considered**: Having the server upload the image to Cloudinary. This was rejected because the serverless function execution time limits (and env secrets configuration) favor client-side uploads.

### 3. User Identifier Resolution
- **Decision**: Compute a SHA-256 hash of the client's IP and User Agent on the server to act as a consistent, anonymous `userId`.
- **Rationale**: Resolves the bug where `user_id` logged the confidence enum value, providing a reliable and secure anonymous ID.

## Risks / Trade-offs

- **Risk**: Awaiting Cloudinary upload in the client before calling `/api/analyze` might add latency.
  - **Mitigation**: The image compression already runs on the client, minimizing upload payload sizes.
