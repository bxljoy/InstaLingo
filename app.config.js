export default ({ config }) => ({
  ...config,
  name: "InstaLingo",
  slug: "instalingo",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "instalingo",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.instalingo.app",
    googleServicesFile: "./GoogleService-Info.plist",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
    package: "com.instalingo.app",
  },
  web: {
    favicon: "./assets/images/favicon.png",
  },
  extra: {
    visionApiKey: process.env.VISION_API_KEY,
    googleTranslateApiKey: process.env.GOOGLE_TRANSLATE_API_KEY,
    googleTtsApiKey: process.env.GOOGLE_TTS_API_KEY,
    firebaseAppId: process.env.FIREBASE_APP_ID,
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    webClientId: process.env.WEB_CLIENT_ID,
    eas: {
      projectId: "13b1a28f-354c-45d2-9907-91a9f9abce7e",
    },
  },
  plugins: [
    "expo-router",
    "expo-camera",
    "expo-image-picker",
    "expo-secure-store",
    "expo-av",
    "expo-notifications",
    [
      "expo-notifications",
      {
        icon: "./assets/images/notification-icon.png",
        color: "#ffffff",
        sounds: [
          "./assets/sounds/notification-sound.m4r",
          "./assets/sounds/notification-sound-other.m4r",
        ],
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          usesCleartextTraffic: true,
        },
        ios: {
          useFrameworks: "static",
        },
      },
    ],
    "@react-native-google-signin/google-signin",
    "expo-dev-client",
  ],
});
