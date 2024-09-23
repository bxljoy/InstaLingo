import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "@/firebase/config";
import { deleteUser, signOut } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { clearExtractedTexts } from "@/lib/db";

export default function ProfileScreen() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const user = auth.currentUser;

  const handleLogOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Error", "Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: confirmDeleteAccount },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    setIsDeleting(true);
    if (user) {
      try {
        // Delete user data from Firestore
        await deleteDoc(doc(db, "users", user.uid));
        // Clear extracted texts
        await clearExtractedTexts(user.uid);
        // Delete the user account
        await deleteUser(user);
        // Sign out and navigate to sign in screen
        await auth.signOut();
        router.replace("/sign-in");
      } catch (error) {
        console.error("Error deleting account:", error);
        Alert.alert("Error", "Failed to delete account. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-black mb-6">Profile</Text>
      {user && (
        <View className="mb-6">
          <Text className="text-lg text-gray-600">Email: {user.email}</Text>
        </View>
      )}
      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-lg mb-4"
        onPress={() => router.push("/privacy-settings")}
      >
        <Text className="text-white text-center font-semibold">
          Privacy Settings
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-lg mb-4"
        onPress={handleLogOut}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white text-center font-semibold">Log Out</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-red-500 p-4 rounded-lg"
        onPress={handleDeleteAccount}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white text-center font-semibold">
            Delete Account
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
