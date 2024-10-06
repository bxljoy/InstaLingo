import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "@/firebase/config";
import {
  deleteUser,
  signOut,
  sendEmailVerification,
  reload,
} from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { clearExtractedTexts } from "@/lib/db";
import useStore from "@/store/appStore";

export default function ProfileScreen() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const router = useRouter();

  const user = useStore.use.user();

  useEffect(() => {
    const checkEmailVerification = async () => {
      if (user) {
        await reload(user);
        setIsEmailVerified(user.emailVerified);
      }
    };

    checkEmailVerification();

    // Set up an interval to check periodically
    const intervalId = setInterval(checkEmailVerification, 5000); // Check every 5 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [user]);

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

  const handleVerifyEmail = async () => {
    if (user && !isEmailVerified) {
      setIsVerifying(true);
      try {
        await sendEmailVerification(user);
        Alert.alert(
          "Verification Email Sent",
          "Please check your inbox and verify your email."
        );
      } catch (error) {
        console.error("Error sending verification email:", error);
        Alert.alert(
          "Error",
          "Failed to send verification email. Please try again later."
        );
      } finally {
        setIsVerifying(false);
      }
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-black mb-6">Profile</Text>
      {user && (
        <View className="mb-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg text-gray-600">Email: {user.email}</Text>
            {isEmailVerified ? (
              <Text className="text-sm text-green-500">Verified</Text>
            ) : (
              <TouchableOpacity
                onPress={handleVerifyEmail}
                disabled={isVerifying}
              >
                <Text className="text-sm text-red-500">
                  {isVerifying ? "Sending..." : "Not Verified"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {!isEmailVerified && (
            <Text className="text-sm text-gray-500 mt-1">
              Tap "Not Verified" to resend verification email
            </Text>
          )}
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
