import { auth } from "@/firebase/config";
import { TranslatedEntity } from "@/types/definitions";

const GOOGLE_TRANSLATE_URL =
  "https://europe-central2-instalingo-434320.cloudfunctions.net/googleTranslateFirebase";

async function getIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user.getIdToken();
}

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<TranslatedEntity> {
  try {
    const idToken = await getIdToken();
    const response = await fetch(GOOGLE_TRANSLATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
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
