import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Text,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  SharedValue,
  withRepeat,
  cancelAnimation,
} from "react-native-reanimated";
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
import Toast, { ErrorToast } from "react-native-toast-message";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { AITemplates } from "@/constants/AITemplates";
import LoadingIndicator from "@/components/LoadingIndicator";

export default function HomeScreen() {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [promptType, setPromptType] = useState<
    "extract" | "identify" | "summary" | "custom"
  >("extract");
  const router = useRouter();
  const isPro = useStore.use.isPro();
  const setIsPro = useStore.use.setIsPro();
  const [isDailyLimitModalVisible, setIsDailyLimitModalVisible] =
    useState(false);
  const [limitType, setLimitType] = useState<"api" | "AI">("api");
  const [aiInstructions, setAiInstructions] = useState("");

  const mainButtonScale = useSharedValue(1);
  const button1Opacity = useSharedValue(0);
  const button2Opacity = useSharedValue(0);
  const button3Opacity = useSharedValue(0);
  const button4Opacity = useSharedValue(0);
  const button1Position = useSharedValue({ x: 0, y: 0 });
  const button2Position = useSharedValue({ x: 0, y: 0 });
  const button3Position = useSharedValue({ x: 0, y: 0 });
  const button4Position = useSharedValue({ x: 0, y: 0 });

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  // const handleSheetChanges = useCallback((index: number) => {
  //   console.log("handleSheetChanges", index);
  // }, []);

  const snapPoints = useMemo(() => ["25%", "50%", "75%", "100%"], []);

  const toastConfig = {
    /*
      Overwrite 'error' type,
      by modifying the existing `ErrorToast` component
    */
    error: (props: any) => (
      <ErrorToast
        {...props}
        text1Style={{
          fontSize: 20,
          fontWeight: "bold",
        }}
        text2Style={{
          fontSize: 16,
          color: "red",
        }}
      />
    ),
  };

  const handleHeartBeat = () => {
    mainButtonScale.value = withRepeat(
      withTiming(1.2, { duration: 1000 }),
      -1,
      true
    );
  };

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } =
        await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus === "granted");

      const { status: galleryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus === "granted");
    })();

    handleHeartBeat();
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
          prompt =
            "Convert all text in this image into a digital format, maintaining the original structure and formatting. Include descriptions of any images or diagrams";
        } else if (promptType === "custom") {
          console.log("AI Instructions:", aiInstructions);
          prompt = aiInstructions;
        }

        if (prompt.length === 0) {
          Toast.show({
            type: "error",
            text1: "No AI instructions provided",
            text2: "Please provide AI instructions",
            position: "top",
            onPress: () => {
              Toast.hide();
            },
          });
          return;
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
      } else {
        // Alert.alert("No image selected", "Please select an image to analyze");
        Toast.show({
          type: "error",
          text1: "No image selected",
          text2: "Please select an image to analyze",
          position: "bottom",
          onPress: () => {
            Toast.hide();
          },
        });
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
    const isHidden = button1Opacity.value === 0;

    mainButtonScale.value = withTiming(isHidden ? 0.8 : 1, { duration: 300 });

    [button1Opacity, button2Opacity, button3Opacity, button4Opacity].forEach(
      (opacity) => {
        opacity.value = withTiming(isHidden ? 1 : 0, { duration: 300 });
      }
    );

    if (isHidden) {
      button1Position.value = withTiming({ x: -95, y: -65 }, { duration: 300 });
      button2Position.value = withTiming({ x: 95, y: -65 }, { duration: 600 });
      button3Position.value = withTiming({ x: -95, y: 65 }, { duration: 900 });
      button4Position.value = withTiming({ x: 95, y: 65 }, { duration: 1200 });
    } else {
      [
        button1Position,
        button2Position,
        button3Position,
        button4Position,
      ].forEach((position) => {
        position.value = withTiming({ x: 0, y: 0 }, { duration: 300 });
      });
    }

    // if (!isHidden) {
    //   handleHeartBeat();
    // }
  };

  const mainButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mainButtonScale.value }],
  }));

  const createButtonStyle = (
    opacity: SharedValue<number>,
    position: SharedValue<{ x: number; y: number }>
  ) =>
    useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [
        { translateX: position.value.x },
        { translateY: position.value.y },
      ],
    }));

  const button1Style = createButtonStyle(button1Opacity, button1Position);
  const button2Style = createButtonStyle(button2Opacity, button2Position);
  const button3Style = createButtonStyle(button3Opacity, button3Position);
  const button4Style = createButtonStyle(button4Opacity, button4Position);

  // Add this new function to expand the BottomSheet
  const expandBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  // Modify the handleAIOption function
  const handleAIOption = (
    option: "extract" | "identify" | "summary" | "custom"
  ) => {
    setPromptType(option);
    if (option === "custom") {
      expandBottomSheet();
    } else {
      handleAnalyze();
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  const clearAiInstructions = () => {
    setAiInstructions("");
  };

  const handleAnalyzeWithCustomPrompt = () => {
    closeBottomSheet();
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

        <View className="items-center justify-center h-60 bg-white">
          <Animated.View style={[{ position: "absolute" }, button1Style]}>
            <TouchableOpacity
              onPress={() => handleAIOption("extract")}
              className="items-center justify-center w-20 h-20 rounded-full bg-[#7CF5FF]"
            >
              <Text className="text-white font-bold text-xs">Extract</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[{ position: "absolute" }, button2Style]}>
            <TouchableOpacity
              onPress={() => handleAIOption("identify")}
              className="items-center justify-center w-20 h-20 rounded-full bg-[#00CCDD]"
            >
              <Text className="text-white font-bold text-xs">Identify</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[{ position: "absolute" }, button3Style]}>
            <TouchableOpacity
              onPress={() => handleAIOption("summary")}
              className="items-center justify-center w-20 h-20 rounded-full bg-[#4F75FF]"
            >
              <Text className="text-white font-bold text-xs">Summary</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[{ position: "absolute" }, button4Style]}>
            <TouchableOpacity
              onPress={() => handleAIOption("custom")}
              className="items-center justify-center w-20 h-20 rounded-full bg-[#6439FF]"
            >
              <Text className="text-white font-bold text-xs">Custom</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={mainButtonStyle}>
            <TouchableOpacity
              onPress={toggleAIOptions}
              className="bg-purple-500 rounded-full w-36 h-36 items-center justify-center"
            >
              <Text className="text-white font-bold text-base text-center">
                Try AI
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
      <ReviewPrompt />
      <DailyLimitModal
        limitType={limitType}
        isVisible={isDailyLimitModalVisible}
        onUpgrade={handleUpgrade}
        onClose={() => setIsDailyLimitModalVisible(false)}
      />
      <Toast config={toastConfig} />

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        // onChange={handleSheetChanges}
        enablePanDownToClose={true}
        enableHandlePanningGesture={true}
        handleStyle={{
          backgroundColor: "#F0F0F0",
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
        }}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <BottomSheetView style={styles.contentContainer}>
            <Text className="text-lg font-bold mt-4 mb-2">AI Instructions</Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 rounded-md p-2 mb-1 h-40 pr-10 text-lg"
                multiline
                numberOfLines={4}
                placeholder="Enter instructions for AI..."
                value={aiInstructions}
                onChangeText={setAiInstructions}
              />
              {aiInstructions.length > 0 && (
                <TouchableOpacity
                  className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full"
                  onPress={clearAiInstructions}
                >
                  <MaterialIcons name="clear" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            <Text className="text-lg font-bold mt-4 mb-2">
              Preset Templates
            </Text>
            <View className="flex-row flex-wrap">
              {AITemplates.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  className={`bg-gray-200 px-3 py-2 rounded-full mr-2 mb-2 ${
                    aiInstructions === option.prompt ? "bg-purple-500" : ""
                  }`}
                  onPress={() => setAiInstructions(option.prompt)}
                >
                  <Text
                    className={`${
                      aiInstructions === option.prompt
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className="bg-purple-500 p-4 rounded-lg items-center mt-6"
              onPress={handleAnalyzeWithCustomPrompt}
            >
              <Text className="text-white font-bold">Perform AI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="mt-6 w-full items-center"
              onPress={closeBottomSheet}
            >
              <Text className="text-purple-500 font-bold">Cancel</Text>
            </TouchableOpacity>
          </BottomSheetView>
        </TouchableWithoutFeedback>
      </BottomSheet>

      {isAnalyzing && <LoadingIndicator message="Analyzing..." />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 16,
  },
});
