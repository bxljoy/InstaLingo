import React, { useState, useEffect } from "react";
import { Image, TouchableOpacity, ScrollView } from "react-native";
import { Text, View } from "@/components/Themed";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { analyzeImage } from "@/lib/visionApi";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
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
        const text = await analyzeImage(image);
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
        {image ? (
          <Image
            source={{ uri: image }}
            className="mt-4 w-80 h-96 self-center mb-6"
          />
        ) : (
          <View className="mt-4 w-80 h-96 self-center bg-gray-200 rounded-lg flex items-center justify-center mb-6">
            <MaterialIcons name="image" size={48} color="gray" />
            <Text className="mt-2 text-gray-500">No image selected</Text>
          </View>
        )}
        <View className="flex flex-row justify-evenly items-center w-full">
          <TouchableOpacity onPress={takePicture} className="flex items-center">
            <MaterialIcons name="camera-alt" size={48} color="coral" />
            <Text className="mt-2">Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleExtractText}
            disabled={isExtracting || !image}
            className={`${
              image ? "bg-red-500" : "bg-gray-500"
            } rounded-full w-28 h-28 shadow-lg items-center justify-center`}
          >
            <Text className="text-white font-bold text-xl text-center">
              {isExtracting ? "Extracting..." : "Extract Text"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage} className="flex items-center">
            <MaterialIcons name="photo" size={48} color="coral" />
            <Text className="mt-2">Album</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
