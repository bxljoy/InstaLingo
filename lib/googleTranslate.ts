const GOOGLE_TRANSLATE_URL =
  "https://europe-central2-instalingo-434320.cloudfunctions.net/googleTranslate";

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  try {
    const response = await fetch(GOOGLE_TRANSLATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, targetLanguage }),
    });

    if (!response.ok) {
      throw new Error("Failed to translate text");
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error("Error translating text:", error);
    throw error;
  }
}
