import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { initDatabase, saveExtractedText } from "@/lib/db";
import { translateText } from "@/lib/googleTranslate";
import RNPickerSelect from "react-native-picker-select";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { TranslatedEntity } from "@/types/definitions";
import { useRouter } from "expo-router";
import { getAllLanguages } from "@/lib/languageCodeMapping";
import { apiWrapper } from "@/lib/apiWrapper";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import useStore from "@/store/appStore";
import LoadingIndicator from "@/components/LoadingIndicator";

export default function AnalysisScreen() {
  const { analysisResult } = useLocalSearchParams();

  const [isSaving, setIsSaving] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [translatedEntity, setTranslatedEntity] =
    useState<TranslatedEntity | null>(null);
  const [copiedAnalysis, setCopiedAnalysis] = useState(false);
  const [copiedTranslated, setCopiedTranslated] = useState(false);
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const user = useStore.use.user();
  const [isTranslating, setIsTranslating] = useState(false);

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

  const handleSaveAnalysisResult = async () => {
    setIsSaving(true);
    try {
      if (user) {
        let entityToSave: TranslatedEntity;
        if (translatedEntity) {
          entityToSave = translatedEntity;
        } else {
          entityToSave = {
            originalText: analysisResult as string,
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
    await handleSaveAnalysisResult();
    setIsSaving(false);
    showBanner();
  };

  const handleTranslate = async () => {
    if (analysisResult) {
      setIsTranslating(true);
      try {
        const translatedEntity = await apiWrapper(() =>
          translateText(analysisResult as string, targetLanguage)
        );
        setTranslatedEntity(translatedEntity);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        console.error("Error translating text:", error);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const generateAndSharePDF = async () => {
    try {
      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h1 style="color: #007AFF;text-align: center;">Analysis Result</h1>
            <p>${analysisResult}</p>
            ${
              translatedEntity
                ? `
                <h1 style="color: #007AFF;text-align: center;">Translated Analysis</h1>
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

      const pdfName = `Analysis_Result_${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.pdf`;
      const pdfUri = `${FileSystem.documentDirectory}${pdfName}`;
      await FileSystem.moveAsync({
        from: uri,
        to: pdfUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri);
      } else {
        Alert.alert(
          "Sharing not available",
          `PDF saved as ${pdfName} in your device's documents folder.`
        );
      }
    } catch (error) {
      console.error("Error generating or sharing PDF:", error);
      Alert.alert("Error", "Failed to generate or share PDF");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
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
              Analysis Result:
            </Text>
            <TouchableOpacity
              onPress={() =>
                copyToClipboard(analysisResult as string, setCopiedAnalysis)
              }
              className="bg-blue-500 p-2 rounded-full"
            >
              <MaterialIcons
                name={copiedAnalysis ? "check" : "content-copy"}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-800 text-sm p-4 bg-gray-100 rounded-md mb-6">
            {analysisResult}
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
                  Translated Analysis:
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
      {isTranslating && <LoadingIndicator message="Translating..." />}
    </SafeAreaView>
  );
}
