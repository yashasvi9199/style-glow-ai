import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.styleglow.ai',
  appName: 'Style Glow AI',
  webDir: 'dist',
  server: {
    cleartext: true,
    hostname: 'localhost'
  },
  plugins: {
    Android: {
      buildOptions: {
        signingType: 'apksigner'
      }
    }
  }
};

export default config;