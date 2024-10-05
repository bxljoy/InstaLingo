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
import { useRouter, useFocusEffect } from "expo-router";
import {
  getExtractedTexts,
  deleteExtractedText,
  initDatabase,
  isCloudSyncEnabled,
  deleteExtractedTextFromCloud,
} from "@/lib/db";
import { ExtractedText } from "@/types/definitions";
import { MaterialIcons } from "@expo/vector-icons";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db as firestoreDb } from "@/firebase/config";
import useStore from "@/store/appStore";

export default function HistoryScreen() {
  const [extractedTexts, setExtractedTexts] = useState<ExtractedText[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const userId = useStore((state) => state.user?.uid);

  const loadExtractedTexts = useCallback(async () => {
    if (userId) {
      try {
        // Fetch from local SQLite
        const localTexts = await getExtractedTexts(userId);

        // Check if Cloud Sync is enabled
        const cloudSyncEnabled = await isCloudSyncEnabled(userId);

        if (cloudSyncEnabled) {
          // Fetch from Firestore
          const extractedTextsRef = collection(
            firestoreDb,
            "users",
            userId,
            "extractedTexts"
          );
          const q = query(extractedTextsRef, orderBy("timestamp", "desc"));
          const querySnapshot = await getDocs(q);
          const cloudTexts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Merge local and cloud data, removing duplicates
          const mergedTexts = [...localTexts, ...cloudTexts].reduce<
            (ExtractedText | { id: string })[]
          >((acc, current) => {
            const x = acc.find(
              (item) => "id" in item && item.id === current.id
            );
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);

          setExtractedTexts(mergedTexts as ExtractedText[]);
        } else {
          setExtractedTexts(localTexts);
        }
      } catch (error) {
        console.error("Error loading extracted texts:", error);
      }
    }
  }, [userId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadExtractedTexts();
    setRefreshing(false);
  }, [loadExtractedTexts]);

  useEffect(() => {
    (async () => {
      await initDatabase();
    })();
  }, []);

  // Use useFocusEffect to refresh the history when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadExtractedTexts();
    }, [loadExtractedTexts])
  );

  const handleDelete = useCallback(
    (id: string | number) => {
      Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (userId) {
              try {
                // Delete from local database
                await deleteExtractedText(userId, id);

                // Delete from cloud (Firestore)
                await deleteExtractedTextFromCloud(userId, id);

                // Reload data
                await loadExtractedTexts();
              } catch (error) {
                console.error("Error deleting item:", error);
                Alert.alert(
                  "Error",
                  "Failed to delete item. Please try again."
                );
              }
            }
          },
        },
      ]);
    },
    [loadExtractedTexts, userId]
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
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
            className="border-b border-gray-200 p-4"
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-4">
                <Text
                  className="text-black text-base mb-2"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.originalText}
                </Text>
                <Text
                  className="text-gray-600 text-base"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.translatedText}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                testID={`delete-button-${item.id}`}
              >
                <MaterialIcons
                  name="delete-outline"
                  size={24}
                  color="#007AFF"
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-4">
            No saved phrases
          </Text>
        }
      />
    </SafeAreaView>
  );
}
