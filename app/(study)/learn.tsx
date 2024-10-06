import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { initDatabase, saveExtractedText } from "@/lib/db";
import { translateText } from "@/lib/googleTranslate";
import RNPickerSelect from "react-native-picker-select";
import { MaterialIcons } from "@expo/vector-icons";
import { TranslatedEntity } from "@/types/definitions";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { getAllLanguages } from "@/lib/languageCodeMapping";
import { auth } from "@/firebase/config";
import { apiWrapper } from "@/lib/apiWrapper";
import useStore from "@/store/appStore";

export default function LearnScreen() {
  const { extractedText } = useLocalSearchParams();

  const [isSaving, setIsSaving] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [translatedEntity, setTranslatedEntity] =
    useState<TranslatedEntity | null>(null);
  const [copiedExtracted, setCopiedExtracted] = useState(false);
  const [copiedTranslated, setCopiedTranslated] = useState(false);
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const user = useStore.use.user();
  useEffect(() => {
    (async () => {
      await initDatabase();
    })();
  }, []);

  const copyToClipboard = async (
    text: string,
    setCopied: (value: boolean) => void
  ) => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveExtractedText = async () => {
    setIsSaving(true);
    try {
      if (user) {
        let entityToSave: TranslatedEntity;
        if (translatedEntity) {
          entityToSave = translatedEntity;
        } else {
          entityToSave = {
            originalText: extractedText as string,
            translatedText: "",
            originalLanguage: "en",
            translatedLanguage: targetLanguage,
          };
        }
        await saveExtractedText(user.uid, entityToSave);
        showBanner();
      } else {
        console.error("User is not logged in.");
      }
    } catch (error) {
      console.error("Error saving translatedEntity:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const showBanner = () => {
    setBannerVisible(true);
    setTimeout(() => setBannerVisible(false), 2000);
  };

  const onSave = async () => {
    setIsSaving(true);
    await handleSaveExtractedText();
    setIsSaving(false);
    showBanner();
  };

  const handleTranslate = async () => {
    if (extractedText) {
      try {
        const translatedEntity = await apiWrapper(() =>
          translateText(extractedText as string, targetLanguage)
        );
        setTranslatedEntity(translatedEntity);
        // Scroll to the bottom after translation is complete
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        console.error("Error translating text:", error);
      }
    }
  };

  const generateAndSharePDF = async () => {
    try {
      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h1 style="color: #007AFF;text-align: center;">Extracted Text</h1>
            <p>${extractedText}</p>
            ${
              translatedEntity
                ? `
                <br /><br /><br />
                <h1 style="color: #007AFF;text-align: center;">Translated Text</h1>
                <p>${translatedEntity.translatedText}</p>
              `
                : ""
            }
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      const pdfName = `text_translation_${Date.now()}.pdf`;
      const pdfUri = `${FileSystem.documentDirectory}${pdfName}`;
      await FileSystem.moveAsync({
        from: uri,
        to: pdfUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri);
      } else {
        Alert.alert("Success", `PDF saved to ${pdfUri}`);
      }
    } catch (error) {
      console.error("Error generating or sharing PDF:", error);
      Alert.alert("Error", "Failed to generate or share PDF");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" ref={scrollViewRef}>
        <View className="bg-gray-100 rounded-t-3xl p-6 mt-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex flex-row items-center gap-2 mb-4"
          >
            <FontAwesome name="arrow-left" size={24} color="#007AFF" />
            <Text className="text-lg text-blue-500">Back</Text>
          </TouchableOpacity>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-800 text-lg font-bold">
              Extracted Text:
            </Text>
            <TouchableOpacity
              onPress={() =>
                copyToClipboard(extractedText as string, setCopiedExtracted)
              }
              className="bg-blue-500 p-2 rounded-full"
            >
              <MaterialIcons
                name={copiedExtracted ? "check" : "content-copy"}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-800 text-sm p-4 bg-gray-100 rounded-md mb-6">
            {extractedText}
          </Text>

          <View className="mb-4">
            <RNPickerSelect
              onValueChange={(value) => setTargetLanguage(value)}
              items={getAllLanguages().map((lang) => ({
                label: lang.name,
                value: lang.translate,
                key: lang.translate,
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
                  borderColor: "#007AFF",
                  borderRadius: 8,
                  color: "#007AFF",
                  paddingRight: 30,
                },
                inputAndroid: {
                  fontSize: 16,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: "#007AFF",
                  borderRadius: 8,
                  color: "#007AFF",
                  paddingRight: 30,
                },
              }}
              Icon={() => {
                return (
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={48}
                    color="#007AFF"
                  />
                );
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleTranslate}
            className="bg-blue-500 p-4 rounded-full mb-6"
          >
            <Text className="text-white text-center font-bold">Translate</Text>
          </TouchableOpacity>

          {translatedEntity && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-800 text-lg font-bold">
                  Translated Text:
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    copyToClipboard(
                      translatedEntity.translatedText,
                      setCopiedTranslated
                    )
                  }
                  className="bg-blue-500 p-2 rounded-full"
                >
                  <MaterialIcons
                    name={copiedTranslated ? "check" : "content-copy"}
                    size={24}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
              <Text className="text-gray-800 text-sm p-4 bg-gray-100 rounded-md">
                {translatedEntity.translatedText}
              </Text>
            </View>
          )}

          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity
              onPress={onSave}
              disabled={isSaving}
              className="bg-blue-500 p-4 rounded-full flex-1 mr-2"
            >
              <Text className="text-white text-center font-bold">
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={generateAndSharePDF}
              className="bg-green-500 p-4 rounded-full flex-1 ml-2"
            >
              <Text className="text-white text-center font-bold">
                Save as PDF
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {bannerVisible && (
        <View className="absolute inset-x-0 bottom-1/2 items-center">
          <View className="bg-blue-500 px-4 py-2 rounded-full">
            <Text className="text-white text-center font-semibold">
              Saved Successfully!
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
