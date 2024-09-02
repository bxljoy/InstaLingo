import React, { useState, useEffect } from "react";
import { Button, Image, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { analyzeImage } from "@/lib/visionApi";
import * as Clipboard from "expo-clipboard";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabOneScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

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
      <Text className="text-2xl font-bold mb-4">InstaLingo</Text>
      <Text className="text-lg mb-4">
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
      {image && <Image source={{ uri: image }} className="mt-4 w-48 h-48" />}
      {extractedText && (
        <View className="flex flex-row items-center mt-4">
          <Text className="text-sm">{extractedText}</Text>
          <TouchableOpacity
            onPress={copyToClipboard}
            className="bg-gray-200 p-2 rounded-md"
          >
            <MaterialIcons name="content-copy" size={24} color="black" />
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        onPress={handleExtractText}
        disabled={isExtracting}
        className=" bg-red-500 rounded-full py-4 px-8 mt-6 shadow-lg"
      >
        <Text className="text-white font-bold text-xl">
          {isExtracting ? "Extracting..." : "Extract Text"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
