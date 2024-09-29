import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as Crypto from "expo-crypto";
import { auth } from "@/firebase/config";

const CLOUD_FUNCTION_URL =
  "https://europe-central2-instalingo-434320.cloudfunctions.net/googleGemini";

const IMAGE_CACHE_DIR = `${FileSystem.cacheDirectory}gemini_api_cache/`;
const MAX_IMAGE_SIZE = 1024; // Max width or height in pixels

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

async function getIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user.getIdToken();
}

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

interface GeminiApiResponse {
  generatedText: string;
}

export const generateContent = async (
  prompt: string,
  imageUri?: string
): Promise<string> => {
  try {
    const cacheKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.MD5,
      prompt + (imageUri || "")
    );
    const cachePath = `${IMAGE_CACHE_DIR}${cacheKey}.json`;

    // Check if the directory exists, if not, create it
    const dirInfo = await FileSystem.getInfoAsync(IMAGE_CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(IMAGE_CACHE_DIR, {
        intermediates: true,
      });
    }

    // Check cache first
    const cacheExists = await FileSystem.getInfoAsync(cachePath);
    if (cacheExists.exists) {
      const cachedData = await FileSystem.readAsStringAsync(cachePath);
      return JSON.parse(cachedData);
    }

    const idToken = await getIdToken();
    const body: { prompt: string; image?: { mimeType: string; data: string } } =
      { prompt };

    if (imageUri) {
      const compressedImageUri = await compressImage(imageUri);
      const base64Image = await getBase64FromUri(compressedImageUri);
      const [mimeType, data] = base64Image.split(",");
      body.image = {
        mimeType: mimeType.split(":")[1].split(";")[0],
        data,
      };
    }

    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
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

    const result: GeminiApiResponse = await response.json();
    const generatedText = result.generatedText;

    // Cache the result
    await FileSystem.writeAsStringAsync(
      cachePath,
      JSON.stringify(generatedText)
    );

    return generatedText;
  } catch (error) {
    console.error("Error:", error);
    return "Error occurred during content generation";
  }
};
