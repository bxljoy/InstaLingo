import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, ScrollView } from "react-native";
import { Text, View } from "@/components/Themed";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { analyzeImage } from "@/lib/visionApi";
import { generateContent } from "@/lib/geminiApi";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { apiWrapper } from "@/lib/apiWrapper";
import ReviewPrompt from "@/components/ReviewPrompt";

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
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

  const handleExtractText = async () => {
    setIsExtracting(true);
    try {
      if (image) {
        const text = await apiWrapper(() => analyzeImage(image));
        router.push({
          pathname: "/learn",
          params: { extractedText: text },
        });
      }
    } catch (error) {
      console.error("Error extracting text:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      if (image) {
        const prompt =
          "Analyze this image and Summarize the content of the image, then doing refining and context-aware adjustments";
        // const prompt =
        //   "Extract all text from this image using OCR and provide a summary of the main ideas. Highlight any important figures or names mentioned.";
        // const prompt =
        //   "Identify the product or objects in the image, and explain their potential use or value based on the image's content.";
        const analysis = await apiWrapper(() => generateContent(prompt, image));
        router.push({
          pathname: "/analysis",
          params: { analysisResult: analysis },
        });
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 pt-2 pb-6">
        <Text className="text-3xl font-bold text-black text-center mb-1">
          InstaLingo
        </Text>
        <Text className="text-lg text-gray-600 text-center mb-4">
          Convert your images to learning material
        </Text>
        <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
          {image ? (
            <Image
              source={{ uri: image }}
              className="w-72 h-72 rounded-2xl self-center mb-4"
            />
          ) : (
            <View className="w-72 h-72 bg-gray-200 rounded-2xl justify-center items-center self-center mb-4">
              <MaterialIcons name="image" size={48} color="#007AFF" />
              <Text className="text-gray-600 mt-2">Tap to select image</Text>
            </View>
          )}
        </TouchableOpacity>
        <View className="flex-row justify-around items-center w-full mt-2 rounded-xl bg-gray-200 p-3">
          <TouchableOpacity onPress={takePicture} className="items-center">
            <MaterialIcons name="camera-alt" size={40} color="#007AFF" />
            <Text className="text-gray-600 mt-1 text-sm">Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleExtractText}
            disabled={isExtracting || !image}
            className={`${
              image ? "bg-blue-500" : "bg-gray-300"
            } rounded-full px-4 py-3`}
          >
            <Text className="text-white font-bold text-base text-center">
              {isExtracting ? "Extracting..." : "Extract Text"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage} className="items-center">
            <MaterialIcons name="photo" size={40} color="#007AFF" />
            <Text className="text-gray-600 mt-1 text-sm">Album</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={handleAnalyze}
          disabled={isAnalyzing || !image}
          className={`${
            image ? "bg-green-500" : "bg-gray-300"
          } rounded-full px-6 py-4 mt-4`}
        >
          <Text className="text-white font-bold text-lg text-center">
            {isAnalyzing ? "Analyzing..." : "Analyze Image By AI"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <ReviewPrompt />
    </SafeAreaView>
  );
}
