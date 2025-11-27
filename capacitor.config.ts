import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.styleandglow.ai',
  appName: 'Style & Glow AI',
  webDir: 'dist',
  plugins: {
    Android: {
      buildOptions: {
        signingType: 'apksigner'
      }
    }
  }
};

export default config;