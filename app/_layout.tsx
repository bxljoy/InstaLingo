import { useEffect, useState, useCallback } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { registerForPushNotificationsAsync } from "@/lib/pushNotifications";
import * as Notifications from "expo-notifications";
import { auth, db } from "@/firebase/config";
import { doc, updateDoc, increment } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useStore from "@/store/appStore";
import { onAuthStateChanged } from "firebase/auth";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const user = useStore.use.user();
  const isLoading = useStore.use.isLoading();
  const setUser = useStore.use.setUser();
  const setIsLoading = useStore.use.setIsLoading();
  const segments = useSegments();
  const router = useRouter();
  const [isNotificationRegistered, setIsNotificationRegistered] =
    useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const incrementAppUsage = useCallback(async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        appUsageCount: increment(1),
      });
    } catch (error) {
      console.error("Error incrementing app usage count:", error);
    }
  }, [user]);

  useEffect(() => {
    // Set up auth listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    // Set up notification listener
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    // Check onboarding status
    const checkOnboardingStatus = async () => {
      const onboardingStatus = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasSeenOnboarding(onboardingStatus === "true");
    };

    checkOnboardingStatus();

    return () => {
      unsubscribe();
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (user) {
      incrementAppUsage();
    }
  }, [user, incrementAppUsage]);

  useEffect(() => {
    if (!isLoading) {
      const inAuthGroup = segments[0] === "(auth)";
      if (!user && !inAuthGroup && hasSeenOnboarding) {
        router.replace("/sign-in");
      } else if (!user && !inAuthGroup && !hasSeenOnboarding) {
        router.replace("/onboarding");
      } else if (user && inAuthGroup) {
        router.replace("/(tabs)");
      }

      if (user && !isNotificationRegistered) {
        registerForPushNotificationsAsync()
          .then((token) => {
            if (token) {
              console.log(
                "Push notification token registered successfully:",
                token
              );
              setIsNotificationRegistered(true);
            } else {
              console.log("Failed to obtain push token");
            }
          })
          .catch((error) => {
            console.error("Error registering push notification:", error);
          });
      }

      const timer = setTimeout(() => {
        SplashScreen.hideAsync();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, segments, isLoading, isNotificationRegistered, hasSeenOnboarding]);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(study)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}
