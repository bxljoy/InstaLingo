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
    if (userData && userData.apiCalls > 1000) {
      // Assuming a limit of 1000 calls
      //   throw new Error("API call limit exceeded");
      Alert.alert("API call limit exceeded", "Please try again later");
      await updateDoc(userDocRef, {
        apiCalls: increment(-1),
      });
      return;
    }

    // Make the actual API call
    const result = await apiCall();
    return result;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
}
