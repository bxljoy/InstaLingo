import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { initDatabase, saveExtractedText } from "@/lib/db";

export default function LearnScreen() {
  const { extractedText } = useLocalSearchParams();
  const colorScheme = useColorScheme();

  const [isSaving, setIsSaving] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

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

  return (
    <View className="flex-1 items-center bg-black bg-opacity-50">
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
        {bannerVisible && (
          <View className="absolute top-[50%] left-2 right-2 bg-blue-700 p-2 rounded-md">
            <Text className="text-center text-white text-lg">
              Text copied to clipboard
            </Text>
          </View>
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
  );
}
