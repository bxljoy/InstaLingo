import React, { useState, useEffect } from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function PrivacySettingsScreen() {
  const [dataCollection, setDataCollection] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setDataCollection(userDoc.data().dataCollection ?? true);
      }
      setIsLoading(false);
    }
  };

  const toggleDataCollection = async (value: boolean) => {
    setDataCollection(value);
    const user = auth.currentUser;
    if (user) {
      await setDoc(
        doc(db, "users", user.uid),
        { dataCollection: value },
        { merge: true }
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacy Settings</Text>
      <View style={styles.settingContainer}>
        <Text style={styles.text}>Allow Data Collection</Text>
        <Switch
          value={dataCollection}
          onValueChange={toggleDataCollection}
          trackColor={{ false: "#767577", true: "#E44EC3" }}
          thumbColor={dataCollection ? "#9D0B51" : "#f4f3f4"}
        />
      </View>
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
