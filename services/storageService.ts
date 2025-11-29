import { StorageConfig } from '../types';

// API Endpoint for upload (reusing config endpoint as requested)
const UPLOAD_API_URL = import.meta.env.VITE_API_URL?.replace('/analyze', '/config') || 'https://style-glow-api.vercel.app/api/config';

export const uploadToCloudinary = async (base64Image: string): Promise<string | null> => {
  // Strict sanitization - only allow alphanumeric, dots, colons, underscores
  const strictSanitize = (str: string) => str.replace(/[^a-zA-Z0-9.:_]/g, '_');

  // Gather device/browser details
  const ua = navigator.userAgent;
  const platform = navigator.platform || 'unknown';
  const isMobile = /Mobi|Android/i.test(ua);
  const deviceType = isMobile ? 'mobile' : 'desktop';
  
  const browserName = (() => {
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('SamsungBrowser')) return 'SamsungBrowser';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    if (ua.includes('Trident')) return 'IE';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Unknown';
  })();

  // Generate anonymous ID (timestamp + random)
  const anonID = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Prepare tags - strictly sanitized
  let tags = 'style_glow_ai_app';
  tags += `,browser:${strictSanitize(browserName)}`;
  tags += `,device:${strictSanitize(deviceType)}`;
  tags += `,platform:${strictSanitize(platform)}`;
  tags += `,anonid:${anonID}`;

  // Prepare context - strictly sanitized
  const contextParts: string[] = [];
  contextParts.push(`ua=${strictSanitize(ua).substring(0, 150)}`);
  contextParts.push(`browser=${strictSanitize(browserName)}`);
  contextParts.push(`device=${strictSanitize(deviceType)}`);
  contextParts.push(`platform=${strictSanitize(platform)}`);
  contextParts.push(`anonid=${anonID}`);

  const context = contextParts.join('|');

  console.log('Frontend - Sending tags:', tags);
  console.log('Frontend - Sending context:', context);

  try {
    const response = await fetch(UPLOAD_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64Image,
        tags,
        context
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Image upload failed:', errorData);
      return null;
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Image:', error);
    return null;
  }
};
