import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, ScrollView } from "react-native";
import { Text, View } from "@/components/Themed";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { analyzeImage } from "@/lib/visionApi";
import * as Clipboard from "expo-clipboard";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { initDatabase, getExtractedTexts, saveExtractedText } from "@/lib/db";
import { useColorScheme } from "@/components/useColorScheme";

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      await initDatabase();
    })();
  }, []);

  const takePicture = async () => {
    if (hasPermission) {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSaveExtractedText = async () => {
    if (extractedText) {
      setIsSaving(true);
      try {
        await saveExtractedText(extractedText);
        console.log("Text saved successfully");
      } catch (error) {
        console.error("Error saving text:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleExtractText = async () => {
    setIsExtracting(true);
    try {
      if (image) {
        const text = await analyzeImage(image);
        setExtractedText(text);
      }
    } catch (error) {
      console.error("Error extracting text:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  const copyToClipboard = async () => {
    if (extractedText) {
      await Clipboard.setStringAsync(extractedText);
      setBannerVisible(true);
      setTimeout(() => setBannerVisible(false), 2000);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <SafeAreaView className="flex-1 items-center">
      <ScrollView>
        <Text className="text-2xl font-bold mb-4 text-center">InstaLingo</Text>
        <Text className="text-lg mb-4 text-center">
          Convert your images to your learning material
        </Text>
        <View className="flex flex-row justify-around w-full">
          <TouchableOpacity onPress={takePicture} className="flex items-center">
            <MaterialIcons name="camera-alt" size={48} color="coral" />
            <Text className="mt-2">Capture</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage} className="flex items-center">
            <MaterialIcons name="photo" size={48} color="coral" />
            <Text className="mt-2">Album</Text>
          </TouchableOpacity>
        </View>
        {image && (
          <Image
            source={{ uri: image }}
            className="mt-4 w-48 h-48 self-center"
          />
        )}
        <TouchableOpacity
          onPress={handleExtractText}
          disabled={isExtracting}
          className=" bg-red-500 rounded-full py-4 mt-6 shadow-lg"
        >
          <Text className="text-white font-bold text-xl self-center">
            {isExtracting ? "Extracting..." : "Extract Text"}
          </Text>
        </TouchableOpacity>
        {extractedText && (
          <View className="flex items-center mt-4">
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
              <View className="absolute bottom-[50%] w-full bg-orange-700 p-2 rounded-md">
                <Text className="text-center text-white text-lg">
                  Text copied to clipboard
                </Text>
              </View>
            )}
            <View className="flex flex-row justify-evenly w-full mt-4">
              <TouchableOpacity
                onPress={copyToClipboard}
                className="bg-blue-500 p-2 rounded-md"
              >
                <Text>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveExtractedText}
                disabled={isSaving}
                className="bg-red-500 p-2 rounded-md"
              >
                <Text>{isSaving ? "Saving..." : "Save"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
