import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { MenuProvider } from "react-native-popup-menu";
import { useEffect, useRef, useState } from "react";
import { registerForPushNotificationsAsync } from "../lib/pushNotifications";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [expoPushToken, setExpoPushToken] = useState<string | undefined>("");
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const router = useRouter();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;

    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const { title, body } = notification.request.content;

        // Handle received notification
        Alert.alert(
          title || "New Notification",
          body || "You have a new notification",
          [{ text: "OK" }]
        );
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { title, body, data } = response.notification.request.content;

        // Handle notification response (e.g., when user taps on the notification)
        if (data && data.screen) {
          // Navigate to a specific screen based on the notification data
          router.push(data.screen);
        } else {
          // Default action: show an alert with the notification content
          Alert.alert(
            title || "Notification Tapped",
            body || "You tapped on a notification",
            [{ text: "OK" }]
          );
        }
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current!
      );
      Notifications.removeNotificationSubscription(responseListener.current!);
    };
  }, [loaded, router]);

  if (!loaded) {
    return null;
  }

  return (
    <MenuProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(study)" options={{ headerShown: false }} />
      </Stack>
    </MenuProvider>
  );
}
