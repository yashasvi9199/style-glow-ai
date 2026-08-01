## Purpose

Enforces server-side rate limits on client requests based on their IP address using Cloudflare D1 storage to prevent API abuse.

## ADDED Requirements

### Requirement: Enforce API Rate Limit

The system SHALL rate limit incoming client requests based on the requesting client's IP address.

#### Scenario: Request under limit
- **WHEN** client sends a request and they have not exceeded the allowed request limit
- **THEN** system SHALL allow the request to proceed to the API handler

#### Scenario: Request exceeds limit
- **WHEN** client sends a request and they have exceeded the allowed request limit within the rate-limiting window
- **THEN** system SHALL block the request and return a 429 Too Many Requests response
