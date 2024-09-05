import { StatusBar } from "expo-status-bar";
import { Platform, SafeAreaView } from "react-native";
import { Text, View } from "@/components/Themed";
import { useLocalSearchParams } from "expo-router";

export default function DetailScreen() {
  const { text, translatedText } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 items-center">
      <Text className="text-2xl font-bold mb-4">Detail</Text>
      <Text className="text-lg mb-2">Original Text:</Text>
      <Text className="mb-4">{text}</Text>
      {translatedText && (
        <>
          <Text className="text-lg mb-2">Translated Text:</Text>
          <Text>{translatedText}</Text>
        </>
      )}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </SafeAreaView>
  );
}
