import { Env } from './models';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers });
  }

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const language = request.headers.get('accept-language')?.split(',')[0] || 'unknown';

  let browserName = 'unknown';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browserName = 'Chrome';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browserName = 'Safari';
  else if (userAgent.includes('Firefox')) browserName = 'Firefox';
  else if (userAgent.includes('Edg')) browserName = 'Edge';
  else if (userAgent.includes('OPR') || userAgent.includes('Opera')) browserName = 'Opera';

  // Standard web crypto hash helper
  const msgBuffer = new TextEncoder().encode(ip + userAgent);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const anonID = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);

  return new Response(
    JSON.stringify({
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      uploadPreset: env.CLOUDINARY_UPLOAD_PRESET,
      clientIp: ip,
      anonID,
      userAgent,
      language,
      browserName,
    }),
    { status: 200, headers }
  );
};
