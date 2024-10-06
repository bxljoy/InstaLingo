import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { auth, db } from "@/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import Constants from "expo-constants";

// Configure how notifications should appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Function to handle token updates
async function updatePushToken(token: string) {
  const user = auth.currentUser;
  if (user) {
    await setDoc(
      doc(db, "users", user.uid),
      { pushToken: token },
      { merge: true }
    );
  }
}

// Function to register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!Device.isDevice) {
    console.log("Must use physical device for Push Notifications");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permissions not granted");
    // Instead of returning, we'll attempt to get the token anyway
  }

  try {
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })
    ).data;
    // console.log("Push token obtained:", token);
    await updatePushToken(token);
  } catch (error) {
    console.error("Error getting push token:", error);
  }

  return token;
}

// Function to send a local notification
export async function sendLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: null, // null means send immediately
  });
}
