import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.master.campingsync',
  appName: 'CampingSync',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK',
      backgroundColor: '#fefae8'
    },
    CapacitorHttp: {
      enabled: true,
    },
  }
};

export default config;
