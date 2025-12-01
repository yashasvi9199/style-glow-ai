import { StorageConfig } from '../types';
import { compressImage, getBase64Size } from '../utils/imageCompression';

// API Endpoint for config
const CONFIG_API_URL = import.meta.env.VITE_API_URL?.replace('/analyze', '/config') || 'https://style-glow-api.vercel.app/api/config';

// Upload timeout in milliseconds
const UPLOAD_TIMEOUT = 30000; // 30 seconds

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
  const startTime = Date.now();
  
  try {
    // Step 1: Compress image before upload (this alone can reduce upload time by 70%)
    const originalSize = getBase64Size(base64Image);
    console.log(`Original image size: ${originalSize.toFixed(2)} KB`);
    
    const compressedImage = await compressImage(base64Image, 1200, 1200, 0.85);
    const compressedSize = getBase64Size(compressedImage);
    console.log(`Compressed image size: ${compressedSize.toFixed(2)} KB (${((1 - compressedSize/originalSize) * 100).toFixed(1)}% reduction)`);
    
    // Step 2: Get config
    const config = await getCloudinaryConfig();
    
    if (!config || !config.cloudName || !config.uploadPreset) {
      console.error('Cloudinary configuration missing');
      return null;
    }

    const url = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;
    
    const formData = new FormData();
    formData.append('file', compressedImage);
    formData.append('upload_preset', config.uploadPreset);
    
    // Add metadata tags
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

    // Step 3: Upload with timeout protection
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
    const uploadTime = Date.now() - startTime;
    console.log(`Upload completed in ${(uploadTime / 1000).toFixed(2)}s`);
    
    return data.secure_url;
  } catch (error) {
    const uploadTime = Date.now() - startTime;
    console.error(`Upload failed after ${(uploadTime / 1000).toFixed(2)}s:`, error);
    return null;
  }
};

