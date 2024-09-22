import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as Crypto from "expo-crypto";
import { auth } from "@/firebase/config";

const CLOUD_FUNCTION_URL =
  "https://europe-central2-instalingo-434320.cloudfunctions.net/visionApiProxyFirebase";

// const CLOUD_FUNCTION_URL =
//   "https://cloud-vision-api-495756842233.europe-central2.run.app";

const IMAGE_CACHE_DIR = `${FileSystem.cacheDirectory}vision_api_cache/`;
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

export const analyzeImage = async (
  imageUri: string
): Promise<string | null> => {
  try {
    const cacheKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.MD5,
      imageUri
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
      // console.log("Using cached vision API result");
      const cachedData = await FileSystem.readAsStringAsync(cachePath);
      return JSON.parse(cachedData);
    }

    // console.log("Fetching new vision API result");
    const idToken = await getIdToken();
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

    const result = await response.json();
    const detections = result.text;

    if (detections) {
      // Cache the result
      await FileSystem.writeAsStringAsync(
        cachePath,
        JSON.stringify(detections)
      );
      return detections;
    } else {
      // console.log("No text detected");
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
