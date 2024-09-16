import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { MenuProvider } from "react-native-popup-menu";
import { useEffect, useRef, useState, useCallback } from "react";
import { registerForPushNotificationsAsync } from "../lib/pushNotifications";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { auth } from "../firebase/config";
import { User, onAuthStateChanged } from "firebase/auth";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [expoPushToken, setExpoPushToken] = useState<string | undefined>("");
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const handleNotification = useCallback(
    (notification: Notifications.Notification) => {
      const { title, body } = notification.request.content;
      Alert.alert(
        title || "New Notification",
        body || "You have a new notification",
        [{ text: "OK" }]
      );
    },
    []
  );

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const { title, body, data } = response.notification.request.content;
      if (data && data.screen) {
        router.push(data.screen);
      } else {
        Alert.alert(
          title || "Notification Tapped",
          body || "You tapped on a notification",
          [{ text: "OK" }]
        );
      }
    },
    [router]
  );

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    const setupApp = async () => {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    };

    setupApp();
  }, [fontsLoaded]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/sign-in");
      }
    });

    return unsubscribeAuth;
  }, [router]);

  useEffect(() => {
    if (!fontsLoaded) return;

    const setupNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      setExpoPushToken(token);

      notificationListener.current =
        Notifications.addNotificationReceivedListener(handleNotification);
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener(
          handleNotificationResponse
        );
    };

    setupNotifications();

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [fontsLoaded, handleNotification, handleNotificationResponse]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <MenuProvider>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(study)" options={{ headerShown: false }} />
      </Stack>
    </MenuProvider>
  );
}
