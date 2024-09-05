import { useCallback, useState, useEffect } from "react";
import { Text, View } from "@/components/Themed";
import { SafeAreaView, RefreshControl, FlatList, Button } from "react-native";
import { getExtractedTexts } from "@/lib/db";
import { ExtractedText } from "@/types/definitions";
import { translateText } from "@/lib/googleTranslate"; // Add this import

export default function HistoryScreen() {
  const [extractedTexts, setExtractedTexts] = useState<ExtractedText[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const loadExtractedTexts = useCallback(async () => {
    try {
      const texts = await getExtractedTexts();
      setExtractedTexts(texts);
    } catch (error) {
      console.error("Error loading extracted texts:", error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadExtractedTexts();
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, [loadExtractedTexts]);

  const handleTranslate = async (text: string, id: number) => {
    const translated = await translateText(text, "en");
    setTranslations((prev) => ({ ...prev, [id]: translated }));
  };

  useEffect(() => {
    loadExtractedTexts();
  }, [loadExtractedTexts]);

  return (
    <SafeAreaView className="flex-1 items-center">
      <FlatList
        data={extractedTexts}
        renderItem={({ item }) => (
          <View className="m-4 bg-slate-500 p-2 rounded">
            <Text className="text-white">{item.text}</Text>
            <Text className="text-xs text-gray-300 mt-1">
              {new Date(item.timestamp).toLocaleString()}
            </Text>
            {translations[item.id] && (
              <View className="m-4 bg-slate-700 p-2 rounded">
                <Text className="text-white">Translated Text:</Text>
                <Text className="text-white">{translations[item.id]}</Text>
              </View>
            )}
            <Button
              title="Translate"
              onPress={() => handleTranslate(item.text.toString(), item.id)}
            />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={
          <Text className="text-2xl font-bold text-center text-violet-600 m-4">
            Extracted Texts History
          </Text>
        }
        ListEmptyComponent={
          <Text className="text-center text-gray-500">No extracted texts</Text>
        }
        ListFooterComponent={
          <Text className="text-center text-violet-600">End of history</Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}
