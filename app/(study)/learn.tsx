import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { initDatabase, saveExtractedText } from "@/lib/db";
import { translateText } from "@/lib/googleTranslate";
import RNPickerSelect from "react-native-picker-select";
import { MaterialIcons } from "@expo/vector-icons";
import { TranslatedEntity } from "@/types/definitions";

// Add supported languages
const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "zh-TW", name: "Chinese (Traditional)" },
  { code: "ru", name: "Russian" },
  { code: "pt", name: "Portuguese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
  { code: "pa", name: "Punjabi" },
  { code: "ur", name: "Urdu" },
  { code: "vi", name: "Vietnamese" },
  { code: "tr", name: "Turkish" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
  { code: "th", name: "Thai" },
  { code: "ko", name: "Korean" },
  { code: "nl", name: "Dutch" },
  { code: "sv", name: "Swedish" },
  { code: "no", name: "Norwegian" },
  // Add more languages as needed
];

export default function LearnScreen() {
  const { extractedText } = useLocalSearchParams();

  const [isSaving, setIsSaving] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [translatedEntity, setTranslatedEntity] =
    useState<TranslatedEntity | null>(null);

  useEffect(() => {
    (async () => {
      await initDatabase();
    })();
  }, []);

  const copyToClipboard = async () => {
    if (extractedText) {
      await Clipboard.setStringAsync(extractedText as string);
    }
  };

  const onCopy = async () => {
    await copyToClipboard();
    setBannerVisible(true);
    setTimeout(() => setBannerVisible(false), 2000);
  };

  const handleSaveExtractedText = async () => {
    if (translatedEntity) {
      setIsSaving(true);
      try {
        await saveExtractedText(translatedEntity);
        console.log("translatedEntity saved successfully");
      } catch (error) {
        console.error("Error saving translatedEntity:", error);
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
        const translatedEntity = await translateText(
          extractedText as string,
          targetLanguage
        );
        setTranslatedEntity(translatedEntity);
        console.log("TranslatedEntity:", translatedEntity);
      } catch (error) {
        console.error("Error translating text:", error);
      }
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#1B0112]">
      <View className="bg-[#5A0834] rounded-t-3xl p-6 mt-6">
        <Text className="text-[#E44EC3] text-lg font-bold mb-4">
          Extracted Text:
        </Text>
        <Text className="text-white text-sm p-4 bg-[#9D0B51] rounded-md mb-6">
          {extractedText}
        </Text>

        <View className="mb-4">
          <RNPickerSelect
            onValueChange={(value) => setTargetLanguage(value)}
            items={LANGUAGES.map((lang) => ({
              label: lang.name,
              value: lang.code,
              key: lang.code,
            }))}
            value={targetLanguage}
            useNativeAndroidPickerStyle={false}
            placeholder={{ label: "Select a language", value: null }}
            style={{
              inputIOS: {
                fontSize: 16,
                paddingVertical: 12,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: "#E44EC3",
                borderRadius: 8,
                color: "#E44EC3",
                paddingRight: 30,
              },
              inputAndroid: {
                fontSize: 16,
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: "#E44EC3",
                borderRadius: 8,
                color: "#E44EC3",
                paddingRight: 30,
              },
            }}
            Icon={() => {
              return (
                <MaterialIcons
                  name="arrow-drop-down"
                  size={48}
                  color="#E44EC3"
                />
              );
            }}
          />
        </View>

        <TouchableOpacity
          onPress={handleTranslate}
          className="bg-[#9D0B51] p-4 rounded-full mb-6"
        >
          <Text className="text-white text-center font-bold">Translate</Text>
        </TouchableOpacity>

        {translatedEntity && (
          <View className="mb-6">
            <Text className="text-[#E44EC3] text-lg font-bold mb-2">
              Translated Text:
            </Text>
            <Text className="text-white text-sm p-4 bg-[#9D0B51] rounded-md">
              {translatedEntity.translatedText}
            </Text>
          </View>
        )}

        <View className="flex-row justify-around">
          <TouchableOpacity
            onPress={onCopy}
            className="bg-[#E44EC3] p-4 rounded-full flex-1 mr-2"
          >
            <Text className="text-white text-center font-bold">Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSave}
            disabled={isSaving}
            className="bg-[#E44EC3] p-4 rounded-full flex-1 ml-2"
          >
            <Text className="text-white text-center font-bold">
              {isSaving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
