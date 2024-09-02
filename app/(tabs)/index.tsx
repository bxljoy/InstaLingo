import React, { useState, useEffect } from "react";
import { Button, Image } from "react-native";
import { Text, View } from "@/components/Themed";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { analyzeImage } from "@/lib/visionApi";

export default function TabOneScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

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
        // Here you would call the function to send the image to Google Cloud Vision API
        // analyzeImage(result.assets[0].uri);
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
      // Here you would call the function to send the image to Google Cloud Vision API
      // analyzeImage(result.assets[0].uri);
    }
  };

  const extractContent = async () => {
    if (image) {
      const text = await analyzeImage(image);
      setExtractedText(text);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold mb-4">
        OCR with Google Cloud Vision
      </Text>
      <Button title="Take a picture" onPress={takePicture} />
      <Button title="Pick an image from gallery" onPress={pickImage} />
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 200, height: 200, marginTop: 20 }}
        />
      )}
      {extractedText && <Text>{extractedText}</Text>}
      <Button title="Extract Content" onPress={extractContent} />
    </View>
  );
}
