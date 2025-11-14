import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.38193668a92f4b81ad37f226055ff0a0',
  appName: 'Wardiya | وردية',
  webDir: 'dist',
  server: {
    url: 'https://38193668-a92f-4b81-ad37-f226055ff0a0.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    backgroundColor: '#ffffff',
  }
};

export default config;
