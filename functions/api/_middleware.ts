import { Env } from './models';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // Only rate limit POST requests to /api/analyze
  if (url.pathname === '/api/analyze' && request.method === 'POST' && env.DB) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const limitWindowSeconds = 180; // 3 minutes

    try {
      // Check rate limit using D1 database
      const record = await env.DB.prepare(
        "SELECT last_request_at, request_count, (strftime('%s', 'now') - strftime('%s', last_request_at)) AS elapsed_seconds FROM rate_limits WHERE ip_address = ?"
      ).bind(ip).first<{ last_request_at: string; request_count: number; elapsed_seconds: number }>();

      if (record) {
        const { elapsed_seconds, request_count } = record;
        // If within 3-minute window and already made 1 request
        if (elapsed_seconds < limitWindowSeconds && request_count >= 1) {
          const waitTime = limitWindowSeconds - elapsed_seconds;
          return new Response(
            JSON.stringify({
              error: 'Too Many Requests',
              message: `Please wait ${waitTime}s before analyzing another image.`
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': String(waitTime)
              }
            }
          );
        }
      }

      // Upsert rate limit record
      await env.DB.prepare(
        `INSERT INTO rate_limits (ip_address, last_request_at, request_count)
         VALUES (?, CURRENT_TIMESTAMP, 1)
         ON CONFLICT(ip_address) DO UPDATE SET
           last_request_at = CURRENT_TIMESTAMP,
           request_count = 1`
      ).bind(ip).run();

    } catch (dbError) {
      console.error('Rate limiting database check failed, bypassing rate limit:', dbError);
    }
  }

  return await next();
};
