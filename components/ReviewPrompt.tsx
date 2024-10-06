import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Linking,
  Platform,
} from "react-native";
// import * as StoreReview from "expo-store-review";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Constants from "expo-constants";
import useStore from "@/store/appStore";

const DAYS_BETWEEN_PROMPTS = 7; // 7 days
const USAGE_COUNT_THRESHOLD = 5; // 5 times

const ReviewPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const user = useStore((state) => state.user);
  useEffect(() => {
    checkAndShowReviewPrompt();
  }, []);

  const checkAndShowReviewPrompt = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (userData) {
      const lastPrompt = userData.lastReviewPrompt;
      const usageCount = userData.appUsageCount || 0;

      const daysSinceLastPrompt = lastPrompt
        ? (Date.now() - lastPrompt) / (1000 * 60)
        : Infinity;

      if (
        daysSinceLastPrompt > DAYS_BETWEEN_PROMPTS &&
        usageCount >= USAGE_COUNT_THRESHOLD
      ) {
        setIsVisible(true);
      }
    }
  };

  const handleReview = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        { lastReviewPrompt: Date.now() },
        { merge: true }
      );
    }

    // if (await StoreReview.hasAction()) {
    //   await StoreReview.requestReview();
    // } else {
    // If StoreReview.requestReview() doesn't work, open the store page
    // openAppStoreOrPlayStore();
    // }

    openAppStoreOrPlayStore();
    setIsVisible(false);
  };

  const openAppStoreOrPlayStore = () => {
    const bundleId = Platform.select({
      ios: Constants.expoConfig?.ios?.bundleIdentifier,
      android: Constants.expoConfig?.android?.package,
    });

    const appStoreId = (Constants.expoConfig?.ios as any).appStoreId;

    if (bundleId) {
      const url = Platform.select({
        ios: appStoreId
          ? `https://apps.apple.com/app/id${appStoreId}?action=write-review`
          : `https://apps.apple.com/app/${bundleId}`,
        android: `https://play.google.com/store/apps/details?id=${bundleId}&showAllReviews=true`,
      });

      if (url) {
        Linking.openURL(url);
      }
    } else {
      console.warn("App ID not found. Make sure it's set in app.json");
    }
  };

  const handleLater = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-white rounded-lg p-5 items-center w-4/5">
          <Text className="text-xl font-bold mb-2">Enjoying InstaLingo?</Text>
          <Text className="text-center mb-5">
            If you find our app helpful, we'd appreciate your review. It helps
            us improve and reach more language learners!
          </Text>
          <TouchableOpacity
            className="bg-blue-500 py-2 px-5 rounded mb-2"
            onPress={handleReview}
          >
            <Text className="text-white font-bold">Rate InstaLingo</Text>
          </TouchableOpacity>
          <TouchableOpacity className="p-2" onPress={handleLater}>
            <Text className="text-blue-500">Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ReviewPrompt;
