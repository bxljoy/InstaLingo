import * as SecureStore from "expo-secure-store";
import { VISION_API_KEY as INITIAL_API_KEY } from "../config";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as Crypto from "expo-crypto";

const CLOUD_FUNCTION_URL =
  "https://europe-central2-instalingo-434320.cloudfunctions.net/visionApiProxy";

// const CLOUD_FUNCTION_URL =
//   "https://cloud-vision-api-495756842233.europe-central2.run.app";

const API_KEY_STORAGE_KEY = "vision_api_key";
const IMAGE_CACHE_DIR = `${FileSystem.cacheDirectory}vision_api_cache/`;
const MAX_IMAGE_SIZE = 1024; // Max width or height in pixels

async function getApiKey(): Promise<string> {
  let apiKey = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
  if (!apiKey) {
    // If the API key isn't in secure storage, use the initial key and store it
    apiKey = INITIAL_API_KEY;
    await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey);
  }
  return apiKey;
}

async function compressImage(uri: string): Promise<string> {
  const { width, height } = await ImageManipulator.manipulateAsync(uri, [], {
    base64: true,
  });
  const largerDimension = Math.max(width, height);
  const compressionRatio = MAX_IMAGE_SIZE / largerDimension;

  if (compressionRatio < 1) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: width * compressionRatio,
            height: height * compressionRatio,
          },
        },
      ],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  }
  return uri;
}

async function getCachedResult(imageUri: string): Promise<string | null> {
  const hashedUri = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.MD5,
    imageUri
  );
  const cachePath = `${IMAGE_CACHE_DIR}${hashedUri}.json`;
  const cacheExists = await FileSystem.getInfoAsync(cachePath);

  if (cacheExists.exists) {
    const cachedData = await FileSystem.readAsStringAsync(cachePath);
    return JSON.parse(cachedData);
  }
  return null;
}

async function cacheResult(imageUri: string, result: string): Promise<void> {
  const hashedUri = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.MD5,
    imageUri
  );
  const cachePath = `${IMAGE_CACHE_DIR}${hashedUri}.json`;
  await FileSystem.makeDirectoryAsync(IMAGE_CACHE_DIR, { intermediates: true });
  await FileSystem.writeAsStringAsync(cachePath, JSON.stringify(result));
}

export const analyzeImage = async (
  imageUri: string
): Promise<string | null> => {
  try {
    // Check cache first
    const cachedResult = await getCachedResult(imageUri);
    if (cachedResult) return cachedResult;

    const apiKey = await getApiKey();
    const compressedImageUri = await compressImage(imageUri);
    const base64Image = await getBase64FromUri(compressedImageUri);
    const body = JSON.stringify({
      image: base64Image.split(",")[1],
      features: [{ type: "TEXT_DETECTION" }],
    });

    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Server responded with an error:",
        response.status,
        errorText
      );
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // console.log(result);
    const detections = result.text;

    if (detections) {
      await cacheResult(imageUri, detections);
      return detections;
    } else {
      console.log("No text detected");
      return "No text detected";
    }
  } catch (error) {
    console.error("Error:", error);
    return "Error occurred during text extraction";
  }
};

async function getBase64FromUri(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
