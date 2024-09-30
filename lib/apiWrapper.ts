import { auth, db } from "@/firebase/config";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { Alert } from "react-native";

export async function apiWrapper(apiCall: () => Promise<any>) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const userDocRef = doc(db, "users", user.uid);

  try {
    // Increment API call count
    await updateDoc(userDocRef, {
      apiCalls: increment(1),
    });

    // Check if user has exceeded limit
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    if (userData && userData.apiCalls > 50) {
      // Updated limit to 50 calls
      Alert.alert("API call limit exceeded", "Please try again later");
      return null; // Return null instead of throwing an error
    }

    // Make the actual API call
    const result = await apiCall();
    return result;
  } catch (error) {
    console.error("API call failed:", error);
    Alert.alert(
      "Error",
      "An error occurred while processing your request. Please try again."
    );
    return null; // Return null instead of throwing an error
  }
}

export async function geminiApiWrapper(apiCall: () => Promise<any>) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const userDocRef = doc(db, "users", user.uid);

  try {
    // Increment Gemini API call count
    await updateDoc(userDocRef, {
      geminiApiCalls: increment(1),
    });

    // Check if user has exceeded Gemini API limit
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    if (userData && userData.geminiApiCalls > 5) {
      // Assuming a limit of 5 Gemini calls
      Alert.alert("AI call limit exceeded", "Please try again later");
      return null; // Return null instead of throwing an error
    }

    // Make the actual Gemini API call
    const result = await apiCall();
    return result;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    Alert.alert(
      "Error",
      "An error occurred while processing your request. Please try again."
    );
    return null; // Return null instead of throwing an error
  }
}
