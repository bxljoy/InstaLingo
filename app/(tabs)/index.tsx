import React, { useState, useEffect } from "react";
import {
  Image,
  TouchableOpacity,
  ScrollView,
  View as RNView,
  Animated,
} from "react-native";
// import Animated, {
//   useSharedValue,
//   withTiming,
//   useAnimatedStyle,
//   Easing,
// } from 'react-native-reanimated';
import { Text, View } from "@/components/Themed";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { analyzeImage } from "@/lib/visionApi";
import { generateContent } from "@/lib/geminiApi";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { apiWrapper, geminiApiWrapper } from "@/lib/apiWrapper";
import ReviewPrompt from "@/components/ReviewPrompt";
import { presentPaywall } from "@/lib/presentPaywall";
import { DailyLimitModal } from "@/components/DailyLimitModal";
import { Alert, Linking } from "react-native";
import useStore from "@/store/appStore";

export default function HomeScreen() {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [promptType, setPromptType] = useState<
    "extract" | "identify" | "summary"
  >("extract");
  const router = useRouter();
  const isPro = useStore((state) => state.isPro);
  const setIsPro = useStore((state) => state.setIsPro);
  const [isDailyLimitModalVisible, setIsDailyLimitModalVisible] =
    useState(false);
  const [limitType, setLimitType] = useState<"api" | "AI">("api");
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [aiOptionsHeight] = useState(new Animated.Value(0));

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } =
        await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus === "granted");

      const { status: galleryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus === "granted");
    })();
  }, []);

  const takePicture = async () => {
    // console.info("takePicture function called");
    // console.info("hasCameraPermission before check:", hasCameraPermission);

    if (hasCameraPermission === null || hasCameraPermission === false) {
      // console.info("Requesting camera permission");
      const { status } = await Camera.requestCameraPermissionsAsync();
      // console.info("Permission status after request:", status);

      if (status === "denied") {
        Alert.alert(
          "Camera Permission Required",
          "This app needs access to your camera to function properly. Would you like to open settings and grant permission?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
      }

      setHasCameraPermission(status === "granted");
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    if (hasGalleryPermission === null || hasGalleryPermission === false) {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === "denied") {
        Alert.alert(
          "Gallery Permission Required",
          "This app needs access to your gallery to function properly. Would you like to open settings and grant permission?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
      }
      setHasGalleryPermission(status === "granted");
    }

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
        let text;
        if (!isPro) {
          text = await apiWrapper(() => analyzeImage(image));
          if (text) {
            router.push({
              pathname: "/learn",
              params: { extractedText: text },
            });
          } else {
            // console.info("API call hit daily limit");
            setLimitType("api");
            setIsDailyLimitModalVisible(true);
          }
        } else {
          text = await analyzeImage(image);
          if (text) {
            router.push({
              pathname: "/learn",
              params: { extractedText: text },
            });
          }
        }
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
        let prompt = "";
        if (promptType === "summary") {
          prompt =
            "Analyze this image and Summarize the content of the image, then doing refining and context-aware adjustments, and finally output only the summary";
        } else if (promptType === "identify") {
          prompt =
            "Identify the product or objects in the image, and explain their potential use or value based on the image's content.";
        } else if (promptType === "extract") {
          prompt = "Extract all text from this image using OCR";
        }

        let analysis;
        if (!isPro) {
          analysis = await geminiApiWrapper(() =>
            generateContent(prompt, image)
          );
          if (analysis) {
            router.push({
              pathname: "/analysis",
              params: { analysisResult: analysis },
            });
          } else {
            // console.info("Gemini API call hit daily limit");
            setLimitType("AI");
            setIsDailyLimitModalVisible(true);
          }
        } else {
          analysis = await generateContent(prompt, image);
          if (analysis) {
            router.push({
              pathname: "/analysis",
              params: { analysisResult: analysis },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpgrade = async () => {
    const purchased = await presentPaywall();
    if (purchased) {
      setIsPro(true);
    }
    setIsDailyLimitModalVisible(false);
  };

  const toggleAIOptions = () => {
    setShowAIOptions(!showAIOptions);
    Animated.timing(aiOptionsHeight, {
      toValue: showAIOptions ? 0 : 150, // Adjust this value based on your desired height
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleAIOption = (option: "extract" | "identify" | "summary") => {
    setPromptType(option);
    handleAnalyze();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 pb-6">
        <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
          {image ? (
            <Image
              source={{ uri: image }}
              className="w-full h-72 rounded-2xl self-center mb-4"
            />
          ) : (
            <View className="w-full h-72 bg-gray-200 rounded-2xl justify-center items-center self-center mb-4">
              <MaterialIcons name="image" size={48} color="#007AFF" />
              <Text className="text-gray-600 mt-2">Tap to select image</Text>
            </View>
          )}
        </TouchableOpacity>
        <View className="flex-row justify-between items-center w-full mt-2 rounded-xl bg-gray-200 p-1">
          <TouchableOpacity onPress={takePicture} className="items-center p-2">
            <MaterialIcons name="camera-alt" size={48} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleExtractText}
            disabled={isExtracting || !image}
            className={`${
              image ? "bg-blue-500" : "bg-gray-300"
            } rounded-full px-6 py-2`}
          >
            <Text className="text-white font-bold text-base text-center">
              {isExtracting ? "Extracting..." : "Extract Text"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage} className="items-center p-2">
            <MaterialIcons name="photo" size={48} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={toggleAIOptions}
          className="bg-purple-500 rounded-full px-6 py-3 mt-6"
        >
          <Text className="text-white font-bold text-base text-center">
            {showAIOptions ? "Hide AI Options" : "Try AI"}
          </Text>
        </TouchableOpacity>

        <Animated.View style={{ height: aiOptionsHeight, overflow: "hidden" }}>
          <RNView className="flex-row justify-between items-center w-full mt-4 p-1">
            <TouchableOpacity
              onPress={() => handleAIOption("extract")}
              className="items-center justify-center w-24 h-24 rounded-full bg-[#373737]"
            >
              <Text className="text-white font-bold text-sm">Extract</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleAIOption("identify")}
              className="items-center justify-center w-24 h-24 rounded-full bg-[#858585]"
            >
              <Text className="text-white font-bold text-sm">Identify</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleAIOption("summary")}
              className="items-center justify-center w-24 h-24 rounded-full bg-[#AD8E65]"
            >
              <Text className="text-white font-bold text-sm">Summary</Text>
            </TouchableOpacity>
          </RNView>
        </Animated.View>
      </ScrollView>
      <ReviewPrompt />
      <DailyLimitModal
        limitType={limitType}
        isVisible={isDailyLimitModalVisible}
        onUpgrade={handleUpgrade}
        onClose={() => setIsDailyLimitModalVisible(false)}
      />
    </SafeAreaView>
  );
}
