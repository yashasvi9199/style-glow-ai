import { Env } from './models';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const origin = request.headers.get('origin') || '';
  const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.startsWith('capacitor://');
  const allowedDomain = env.PRIMARY_DOMAIN || '';
  const allowLocalhost = env.LOCALHOST === 'true';

  const headers = new Headers({
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    'Content-Type': 'application/json',
  });

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  const isAllowed = (allowLocalhost && isLocalhost) || (allowedDomain && origin.includes(allowedDomain));

  if (!isAllowed) {
    return new Response(
      JSON.stringify({
        error: 'Access Forbidden',
        message: 'This API is restricted to authorized domains only.',
      }),
      { status: 403, headers }
    );
  }

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
