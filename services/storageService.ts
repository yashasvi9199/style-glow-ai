import { StorageConfig } from '../types';

// API Endpoint for config
const CONFIG_API_URL = import.meta.env.VITE_API_URL?.replace('/analyze', '/config') || 'https://style-glow-api.vercel.app/api/config';

interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  clientIp?: string;
}

let cachedConfig: CloudinaryConfig | null = null;

const getCloudinaryConfig = async (): Promise<CloudinaryConfig | null> => {
  if (cachedConfig) return cachedConfig;

  try {
    const response = await fetch(CONFIG_API_URL);
    if (!response.ok) throw new Error('Failed to fetch config');
    cachedConfig = await response.json();
    return cachedConfig;
  } catch (error) {
    console.error('Error fetching Cloudinary config:', error);
    return null;
  }
};

export const uploadToCloudinary = async (base64Image: string): Promise<string | null> => {
  const config = await getCloudinaryConfig();
  
  if (!config || !config.cloudName || !config.uploadPreset) {
    console.error('Cloudinary configuration missing');
    return null;
  }

  const url = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;
  
  const formData = new FormData();
  formData.append('file', base64Image);
  formData.append('upload_preset', config.uploadPreset);
  // Add tags to organize images
  let tags = 'style_glow_ai_app';
  if (config.clientIp) {
    tags += `,ip:${config.clientIp}`;
    formData.append('context', `ip=${config.clientIp}`);
  }
  formData.append('tags', tags);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Image upload failed:', errorData);
      return null;
    }

    const data = await response.json();
    // console.log('Image uploaded securely to Cloudinary:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Image:', error);
    return null;
  }
};
