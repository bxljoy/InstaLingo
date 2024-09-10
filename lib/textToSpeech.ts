import * as SecureStore from "expo-secure-store";
import { GOOGLE_TTS_API_KEY as INITIAL_API_KEY } from "../config";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";

const GOOGLE_TTS_URL =
  "https://europe-central2-instalingo-434320.cloudfunctions.net/googleTextToSpeech";
const API_KEY_STORAGE_KEY = "google_tts_api_key";
const TTS_CACHE_DIR = `${FileSystem.cacheDirectory}tts_cache/`;

async function getApiKey(): Promise<string> {
  let apiKey = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
  if (!apiKey) {
    apiKey = INITIAL_API_KEY;
    await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey);
  }
  return apiKey;
}

export async function textToSpeech(
  text: string,
  languageCode: string
): Promise<Audio.Sound> {
  try {
    const cacheKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.MD5,
      `${text}_${languageCode}`
    );
    const cachePath = `${TTS_CACHE_DIR}${cacheKey}.mp3`;

    // Check if the directory exists, if not, create it
    const dirInfo = await FileSystem.getInfoAsync(TTS_CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(TTS_CACHE_DIR, {
        intermediates: true,
      });
    }

    // Check cache first
    const cacheExists = await FileSystem.getInfoAsync(cachePath);
    if (cacheExists.exists) {
      console.log("Using cached TTS audio file");
      const audio = new Audio.Sound();
      await audio.loadAsync({ uri: cachePath });
      return audio;
    }

    console.log("Fetching new TTS audio file");
    const apiKey = await getApiKey();
    const response = await fetch(GOOGLE_TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ text, languageCode }),
    });

    if (!response.ok) {
      throw new Error("Failed to convert text to speech");
    }

    const data = await response.json();
    const { audioContent } = data;

    // Save the audio content to a file in the cache
    const base64Audio = audioContent.replace("data:audio/mp3;base64,", "");
    await FileSystem.writeAsStringAsync(cachePath, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Create and load the audio
    const audio = new Audio.Sound();
    await audio.loadAsync({ uri: cachePath });

    return audio;
  } catch (error) {
    console.error("Error converting text to speech:", error);
    throw error;
  }
}
