import React, { useState, useEffect } from "react";
import { View, Text, Switch, Alert, StyleSheet } from "react-native";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function PrivacySettingsScreen() {
  const [dataCollection, setDataCollection] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setDataCollection(userDoc.data().dataCollection ?? false);
      } else {
        // If the document doesn't exist, create it with default settings
        await setDoc(
          doc(db, "users", user.uid),
          { dataCollection: false },
          { merge: true }
        );
      }
      setIsLoading(false);
    }
  };

  const toggleDataCollection = async (value: boolean) => {
    if (value) {
      Alert.alert(
        "Enable Cloud Sync",
        "By enabling this feature, you agree to sync your extracted text data to our cloud storage. This allows you to access your data across devices and provides backup.\n\n" +
          "Please note:\n" +
          "- Your extracted text will be stored securely in the cloud\n" +
          "- You can access this data from any device you're logged into\n" +
          "- You can disable sync and delete your cloud data at any time\n\n" +
          "Do you want to enable cloud sync?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setDataCollection(false),
          },
          {
            text: "Enable",
            onPress: async () => {
              setDataCollection(true);
              const user = auth.currentUser;
              if (user) {
                await setDoc(
                  doc(db, "users", user.uid),
                  { dataCollection: true },
                  { merge: true }
                );
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Disable Cloud Sync",
        "Disabling cloud sync will stop syncing new extracted text to the cloud. Your existing cloud data will not be automatically deleted.\n\n" +
          "Do you want to disable cloud sync?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Disable",
            onPress: async () => {
              setDataCollection(false);
              const user = auth.currentUser;
              if (user) {
                await setDoc(
                  doc(db, "users", user.uid),
                  { dataCollection: false },
                  { merge: true }
                );
              }
            },
          },
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-black mb-6">
        Privacy Settings
      </Text>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg text-gray-600">Enable Cloud Sync</Text>
        <Switch
          value={dataCollection}
          onValueChange={toggleDataCollection}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={dataCollection ? "#007AFF" : "#f4f3f4"}
          testID="cloud-sync-toggle"
        />
      </View>
      <Text className="text-sm text-gray-500 mt-2">
        {dataCollection
          ? "Cloud sync is enabled. Your extracted text data is being synced to secure cloud storage for backup and cross-device access."
          : "Cloud sync is disabled. Your extracted text data is only stored locally on this device."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B0112",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E44EC3",
    marginBottom: 20,
  },
  settingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: "#E44EC3",
  },
});
