import { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  owner: 'kateheesunlee',
  name: 'Espresso Log',
  slug: 'espressolog',
  version: '1.0.7',
  orientation: 'portrait',
  icon: './assets/ios-light.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  description: 'Track, refine, and master your espresso extractions.',
  splash: {
    image: './assets/splash-icon-light.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.kateheesunlee.espressolog',
    buildNumber: '1',
    infoPlist: {
      NSCameraUsageDescription:
        'This app needs access to camera to take photos of your espresso shots.',
      NSPhotoLibraryUsageDescription:
        'This app needs access to photo library to save and manage espresso shot photos.',
      ITSAppUsesNonExemptEncryption: false,
    },
    // ⚡ optional custom logic for icon variant
    icon:
      process.env.APP_VARIANT === 'dark'
        ? './assets/ios-dark.png'
        : './assets/ios-light.png',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      monochromeImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: 'com.kateheesunlee.espressolog',
    permissions: [
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    eas: {
      projectId: 'a6235afb-f4ec-418e-9896-329d9c3e8caa',
    },
  },
  plugins: [
    'expo-font',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon-dark.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          image: './assets/splash-icon-light.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#000000',
        },
      },
    ],
  ],
});
