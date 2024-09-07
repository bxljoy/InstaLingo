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
    <SafeAreaView className="flex-1 bg-[#1B0112]">
      <ScrollView className="flex-1 px-5 py-6">
        <Text className="text-3xl font-bold text-[#E44EC3] text-center mb-2">
          InstaLingo
        </Text>
        <Text className="text-lg text-[#9D0B51] text-center mb-6">
          Convert your images to learning material
        </Text>
        {image ? (
          <Image
            source={{ uri: image }}
            className="w-80 h-80 rounded-2xl self-center mb-6"
          />
        ) : (
          <View className="w-80 h-80 bg-[#5A0834] rounded-2xl justify-center items-center self-center mb-6">
            <MaterialIcons name="image" size={48} color="#E44EC3" />
            <Text className="text-[#E44EC3] mt-2">No image selected</Text>
          </View>
        )}
        <View className="flex-row justify-around items-center w-full mt-6">
          <TouchableOpacity onPress={takePicture} className="items-center">
            <MaterialIcons name="camera-alt" size={48} color="#E44EC3" />
            <Text className="text-[#E44EC3] mt-1">Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleExtractText}
            disabled={isExtracting || !image}
            className={`${
              image ? "bg-[#9D0B51]" : "bg-[#5A0834]"
            } rounded-full px-6 py-4 shadow-lg`}
          >
            <Text className="text-white font-bold text-lg text-center">
              {isExtracting ? "Extracting..." : "Extract Text"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage} className="items-center">
            <MaterialIcons name="photo" size={48} color="#E44EC3" />
            <Text className="text-[#E44EC3] mt-1">Album</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
