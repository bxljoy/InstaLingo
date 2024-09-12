import Constants from "expo-constants";

export const VISION_API_KEY =
  (Constants.expoConfig?.extra?.visionApiKey as string) || "";
export const GOOGLE_TRANSLATE_API_KEY =
  (Constants.expoConfig?.extra?.googleTranslateApiKey as string) || "";
export const GOOGLE_TTS_API_KEY =
  (Constants.expoConfig?.extra?.googleTtsApiKey as string) || "";
