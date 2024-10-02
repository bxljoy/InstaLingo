import { auth, db } from "@/firebase/config";
import { doc, getDoc, updateDoc, increment, setDoc } from "firebase/firestore";
import { Alert } from "react-native";
import { UserData } from "@/types/definitions";

const DAILY_LIMIT = 50;
const GEMINI_DAILY_LIMIT = 5;

async function checkAndResetDailyLimit(
  userDocRef: any,
  field: "apiCalls" | "geminiApiCalls",
  limit: number
) {
  const userDoc = await getDoc(userDocRef);
  const userData = userDoc.data() as UserData | undefined;
  const today = new Date().toDateString();

  if (userData && userData.lastResetDate !== today) {
    // Reset the counter if it's a new day
    await updateDoc(userDocRef, {
      [field]: 0,
      lastResetDate: today,
    });
    return 0;
  }

  return userData ? userData[field] : 0;
}

export async function apiWrapper(apiCall: () => Promise<any>) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const userDocRef = doc(db, "users", user.uid);

  try {
    const currentCalls = await checkAndResetDailyLimit(
      userDocRef,
      "apiCalls",
      DAILY_LIMIT
    );

    if (currentCalls >= DAILY_LIMIT) {
      // Alert.alert("Daily API call limit reached. Please try again tomorrow.");
      return null;
    }

    // Increment API call count
    await updateDoc(userDocRef, {
      apiCalls: increment(1),
      lastResetDate: new Date().toDateString(),
    });

    // Make the actual API call
    const result = await apiCall();
    return result;
  } catch (error) {
    console.error("API call failed:", error);
    Alert.alert(
      "Error",
      "An error occurred while processing your request. Please try again."
    );
    return null;
  }
}

export async function geminiApiWrapper(apiCall: () => Promise<any>) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const userDocRef = doc(db, "users", user.uid);

  try {
    const currentCalls = await checkAndResetDailyLimit(
      userDocRef,
      "geminiApiCalls",
      GEMINI_DAILY_LIMIT
    );

    if (currentCalls >= GEMINI_DAILY_LIMIT) {
      // Alert.alert("Daily AI call limit reached. Please try again tomorrow.");
      return null;
    }

    // Increment Gemini API call count
    await updateDoc(userDocRef, {
      geminiApiCalls: increment(1),
      lastResetDate: new Date().toDateString(),
    });

    // Make the actual Gemini API call
    const result = await apiCall();
    return result;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    Alert.alert(
      "Error",
      "An error occurred while processing your request. Please try again."
    );
    return null;
  }
}
