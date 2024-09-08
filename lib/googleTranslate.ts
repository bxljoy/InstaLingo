import * as SecureStore from "expo-secure-store";
import { GOOGLE_TRANSLATE_API_KEY as INITIAL_API_KEY } from "../config";
import { TranslatedEntity } from "../types/definitions";

const GOOGLE_TRANSLATE_URL =
  "https://europe-central2-instalingo-434320.cloudfunctions.net/googleTranslate";

// const GOOGLE_TRANSLATE_URL =
//   "https://googletranslate-495756842233.europe-central2.run.app";

const API_KEY_STORAGE_KEY = "google_translate_api_key";

async function getApiKey(): Promise<string> {
  let apiKey = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
  if (!apiKey) {
    // If the API key isn't in secure storage, use the initial key and store it
    apiKey = INITIAL_API_KEY;
    await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey);
  }
  return apiKey;
}

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<TranslatedEntity> {
  try {
    const apiKey = await getApiKey();
    const response = await fetch(GOOGLE_TRANSLATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ text, targetLanguage }),
    });

    if (!response.ok) {
      throw new Error("Failed to translate text");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error translating text:", error);
    throw error;
  }
}
