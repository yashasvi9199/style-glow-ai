import { compressImage, getBase64Size } from '../utils/imageCompression';

const CONFIG_API_URL = '/api/config';
const UPLOAD_TIMEOUT = 30000;

interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  clientIp?: string;
  anonID?: string;
  userAgent?: string;
  language?: string;
  browserName?: string;
}

let cachedConfig: CloudinaryConfig | null = null;

const getCloudinaryConfig = async (): Promise<CloudinaryConfig | null> => {
  if (cachedConfig) return cachedConfig;
  try {
    const response = await fetch(CONFIG_API_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch config');
    cachedConfig = await response.json();
    return cachedConfig;
  } catch (error) {
    console.error('Error fetching Cloudinary config:', error);
    return null;
  }
};

const buildUploadFormData = (compressedImage: string, config: CloudinaryConfig): FormData => {
  const formData = new FormData();
  formData.append('file', compressedImage);
  formData.append('upload_preset', config.uploadPreset);
  
  let tags = 'style_glow_ai_app';
  let context = '';
  if (config.clientIp) {
    tags += `,ip:${config.clientIp}`;
    context += `ip=${config.clientIp}`;
  }
  if (config.anonID) {
    tags += `,anon:${config.anonID}`;
    context += `|anonID=${config.anonID}`;
  }
  if (config.browserName) {
    tags += `,browser:${config.browserName}`;
    context += `|browser=${config.browserName}`;
  }
  if (config.language) {
    context += `|lang=${config.language}`;
  }
  if (config.userAgent) {
    context += `|ua=${config.userAgent}`;
  }
  
  formData.append('tags', tags);
  if (context) {
    formData.append('context', context);
  }
  return formData;
};

export const uploadToCloudinary = async (base64Image: string): Promise<string | null> => {
  const startTime = Date.now();
  try {
    const compressedImage = await compressImage(base64Image, 1200, 1200, 0.85);
    const config = await getCloudinaryConfig();
    
    if (!config || !config.cloudName || !config.uploadPreset) {
      console.error('Cloudinary configuration missing');
      return null;
    }

    const url = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;
    const formData = buildUploadFormData(compressedImage, config);

    const uploadPromise = fetch(url, {
      method: 'POST',
      body: formData
    });

    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Upload timeout')), UPLOAD_TIMEOUT)
    );

    const response = await Promise.race([uploadPromise, timeoutPromise]);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Image upload failed:', errorData);
      return null;
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error(`Upload failed:`, error);
    return null;
  }
};
