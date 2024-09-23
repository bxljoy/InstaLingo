import { useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useColorScheme, Alert } from "react-native";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useRouter, useSegments } from "expo-router";
import { registerForPushNotificationsAsync } from "@/lib/pushNotifications";
import * as Notifications from "expo-notifications";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      const inAuthGroup = segments[0] === "(auth)";
      if (!user && !inAuthGroup) {
        // Redirect to the sign-in page if the user is not signed in
        router.replace("/sign-in");
      } else if (user && inAuthGroup) {
        // Redirect to the home page if the user is signed in and still in the auth group
        router.replace("/(tabs)");
      }

      // Request push notification permission and register token only when user is logged in
      if (user) {
        registerForPushNotificationsAsync()
          .then((token) => {
            if (token) {
              console.log("Push notification token registered:", token);
            }
          })
          .catch((error) => {
            console.error("Error registering push notification:", error);
          });
      }

      const timer = setTimeout(() => {
        SplashScreen.hideAsync();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, segments, isLoading]);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);

        // Display an alert when a notification is received
        // Alert.alert(
        //   notification.request.content.title ?? "New Notification",
        //   notification.request.content.body ?? "No body",
        //   [{ text: "OK", onPress: () => console.log("Alert closed") }]
        // );
      }
    );

    return () => subscription.remove();
  }, []);

  if (isLoading) {
    return null; // or a loading indicator
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
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

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
