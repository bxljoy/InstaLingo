import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { initDatabase, saveExtractedText } from "@/lib/db";
import { translateText } from "@/lib/googleTranslate";
import { Picker } from "@react-native-picker/picker";

// Add supported languages
const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  // Add more languages as needed
];

export default function LearnScreen() {
  const { extractedText } = useLocalSearchParams();
  const colorScheme = useColorScheme();

  const [isSaving, setIsSaving] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [translatedText, setTranslatedText] = useState("");

  useEffect(() => {
    (async () => {
      await initDatabase();
    })();
  }, []);

  const copyToClipboard = async () => {
    if (extractedText) {
      await Clipboard.setStringAsync(extractedText as string);
      setBannerVisible(true);
      setTimeout(() => setBannerVisible(false), 2000);
    }
  };

  const onCopy = async () => {
    await copyToClipboard();
    setBannerVisible(true);
    setTimeout(() => setBannerVisible(false), 2000);
  };

  const handleSaveExtractedText = async () => {
    if (extractedText) {
      setIsSaving(true);
      try {
        await saveExtractedText(extractedText as string);
        console.log("Text saved successfully");
      } catch (error) {
        console.error("Error saving text:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const onSave = async () => {
    setIsSaving(true);
    await handleSaveExtractedText();
    setIsSaving(false);
  };

  const handleTranslate = async () => {
    if (extractedText) {
      try {
        const translated = await translateText(
          extractedText as string,
          targetLanguage
        );
        setTranslatedText(translated);
      } catch (error) {
        console.error("Error translating text:", error);
      }
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="bg-black bg-opacity-50"
    >
      <View className="flex-1 items-center">
        <View className="bg-white rounded-t-3xl p-6">
          <Text
            className={`text-sm p-4 rounded-md ${
              colorScheme === "dark"
                ? "bg-slate-700 text-white"
                : "bg-slate-300 text-black"
            }`}
          >
            {extractedText}
          </Text>

          <Picker
            selectedValue={targetLanguage}
            onValueChange={(itemValue) => setTargetLanguage(itemValue)}
            className="mt-4 mb-2"
          >
            {LANGUAGES.map((lang) => (
              <Picker.Item
                key={lang.code}
                label={lang.name}
                value={lang.code}
              />
            ))}
          </Picker>

          <TouchableOpacity
            onPress={handleTranslate}
            className="bg-green-500 p-2 rounded-md mb-4"
          >
            <Text className="text-white text-center">Translate</Text>
          </TouchableOpacity>

          {translatedText && (
            <Text
              className={`text-sm p-4 rounded-md mt-4 ${
                colorScheme === "dark"
                  ? "bg-slate-600 text-white"
                  : "bg-slate-200 text-black"
              }`}
            >
              {translatedText}
            </Text>
          )}

          <View className="flex flex-row justify-evenly w-full mt-4">
            <TouchableOpacity
              onPress={onCopy}
              className="bg-blue-500 p-2 rounded-md"
            >
              <Text className="text-white">Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSave}
              disabled={isSaving}
              className="bg-red-500 p-2 rounded-md"
            >
              <Text className="text-white">
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
