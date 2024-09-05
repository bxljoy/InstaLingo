import * as SecureStore from "expo-secure-store";
import { API_KEY as INITIAL_API_KEY } from "../config";

const CLOUD_FUNCTION_URL =
  "https://europe-central2-instalingo-434320.cloudfunctions.net/visionApiProxy";
const API_KEY_STORAGE_KEY = "vision_api_key";

async function getApiKey(): Promise<string> {
  let apiKey = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
  if (!apiKey) {
    // If the API key isn't in secure storage, use the initial key and store it
    apiKey = INITIAL_API_KEY;
    await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey);
  }
  return apiKey;
}

export const analyzeImage = async (
  imageUri: string
): Promise<string | null> => {
  try {
    const apiKey = await getApiKey();

    const base64Image = await getBase64FromUri(imageUri);
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
