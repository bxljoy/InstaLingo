import React, { useCallback, useState, useEffect } from "react";
import {
  Text,
  View,
  SafeAreaView,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { getExtractedTexts, deleteExtractedText, initDatabase } from "@/lib/db";
import { ExtractedText } from "@/types/definitions";
import { MaterialIcons } from "@expo/vector-icons";
import { auth } from "@/firebase/config";

export default function HistoryScreen() {
  const [extractedTexts, setExtractedTexts] = useState<ExtractedText[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const userId = auth.currentUser?.uid;

  const loadExtractedTexts = useCallback(async () => {
    if (userId) {
      try {
        const texts = await getExtractedTexts(userId);
        setExtractedTexts(texts);
      } catch (error) {
        console.error("Error loading extracted texts:", error);
      }
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadExtractedTexts();
    setRefreshing(false);
  }, [loadExtractedTexts]);

  useEffect(() => {
    (async () => {
      await initDatabase();
    })();
    loadExtractedTexts();
  }, []);

  const handleDelete = useCallback(
    (id: number) => {
      Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (userId) {
              try {
                await deleteExtractedText(userId, id);
                await loadExtractedTexts();
              } catch (error) {
                console.error("Error deleting item:", error);
              }
            }
          },
        },
      ]);
    },
    [loadExtractedTexts]
  );

  return (
    <SafeAreaView className="flex-1 bg-[#1B0112]">
      <FlatList
        data={extractedTexts}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: "/detail",
                params: {
                  id: item.id,
                  text: item.originalText,
                  translatedText: item.translatedText,
                },
              })
            }
            className="border-b border-[#5A0834] p-4"
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-4">
                <Text
                  className="text-[#E44EC3] text-base mb-2"
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  {item.originalText}
                </Text>
                <Text
                  className="text-[#9D0B51] text-base"
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  {item.translatedText}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <MaterialIcons
                  name="delete-outline"
                  size={24}
                  color="#E44EC3"
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text className="text-center text-[#9D0B51] mt-4">
            No saved phrases
          </Text>
        }
      />
    </SafeAreaView>
  );
}
