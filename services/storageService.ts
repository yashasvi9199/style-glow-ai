
import { StorageConfig } from '../types';

export const uploadToCloudinary = async (base64Image: string, config: StorageConfig): Promise<string | null> => {
  if (!config.enabled || !config.cloudName || !config.uploadPreset) {
    return null;
  }

  const url = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;
  
  const formData = new FormData();
  formData.append('file', base64Image);
  formData.append('upload_preset', config.uploadPreset);
  // Add tags to organize images
  formData.append('tags', 'style_glow_ai_app');

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary upload failed:', errorData);
      return null;
    }

    const data = await response.json();
    console.log('Image uploaded securely to Cloudinary:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
};
