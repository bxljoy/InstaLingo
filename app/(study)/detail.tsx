import React from "react";
import {
  ScrollView,
  SafeAreaView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function DetailScreen() {
  const { text, translatedText } = useLocalSearchParams();
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-[#1B0112]">
      <ScrollView className="flex-1 px-4 py-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex flex-row items-center gap-2 mb-4"
        >
          <FontAwesome name="arrow-left" size={24} color="#E44EC3" />
          <Text className="text-lg text-[#E44EC3]">Back</Text>
        </TouchableOpacity>

        <View className="bg-[#5A0834] rounded-lg p-4 mb-6">
          <Text className="text-lg mb-2 text-[#E44EC3]">Original Text:</Text>
          <Text className="text-white">{text}</Text>
        </View>
        {translatedText && (
          <View className="bg-[#5A0834] rounded-lg p-4">
            <Text className="text-lg mb-2 text-[#E44EC3]">
              Translated Text:
            </Text>
            <Text className="text-white">{translatedText}</Text>
          </View>
        )}
      </ScrollView>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </SafeAreaView>
  );
}
