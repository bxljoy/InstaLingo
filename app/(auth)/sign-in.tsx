import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Alert } from "react-native";
import { Text } from "@/components/Themed";
import {
  signInWithEmailAndPassword,
  signInWithCredential,
  OAuthProvider,
  User,
  signOut,
} from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider } from "firebase/auth";
import Constants from "expo-constants";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import * as AppleAuthentication from "expo-apple-authentication";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        Constants.expoConfig?.extra?.googleWebClientId ||
        process.env.WEB_CLIENT_ID,
    });
  }, []);

  const initializeApiUsage = async (user: User) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // New user, initialize API usage
      await setDoc(userDocRef, {
        apiCalls: 0,
        lastResetDate: new Date().toISOString(),
      });
    } else {
      // Existing user, check if we need to reset the counter
      const userData = userDoc.data();
      const lastResetDate = new Date(userData.lastResetDate);
      const now = new Date();

      if (
        now.getMonth() !== lastResetDate.getMonth() ||
        now.getFullYear() !== lastResetDate.getFullYear()
      ) {
        // Reset counter if it's a new month
        await setDoc(userDocRef, {
          apiCalls: 0,
          lastResetDate: now.toISOString(),
        });
      }
    }
  };

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await initializeApiUsage(userCredential.user);
      router.replace("/(tabs)");
    } catch (error: any) {
      let errorMessage = "An error occurred during sign in. Please try again.";

      if (error.code === "auth/user-not-found") {
        errorMessage =
          "No account found with this email. Please check your email or sign up.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address. Please enter a valid email.";
      }

      Alert.alert("Sign In Error", errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const { data } = response;
        const idToken = data?.idToken;
        if (idToken) {
          const credential = GoogleAuthProvider.credential(idToken);
          const userCredential = await signInWithCredential(auth, credential);
          await initializeApiUsage(userCredential.user);
          router.replace("/(tabs)");
        }
      }
    } catch (error: any) {
      let errorMessage =
        "An error occurred during Google Sign In. Please try again.";
      if (error.code === "SIGN_IN_CANCELLED") {
        errorMessage = "Google Sign In was cancelled.";
      } else if (error.code === "IN_PROGRESS") {
        errorMessage = "Google Sign In is already in progress.";
      } else if (error.code === "PLAY_SERVICES_NOT_AVAILABLE") {
        errorMessage = "Google Play Services is not available on this device.";
      }
      Alert.alert("Google Sign In Error", errorMessage);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      console.log("Starting Apple Sign In process");
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // console.log("Apple Authentication completed", credential);

      if (credential.identityToken) {
        const provider = new OAuthProvider("apple.com");
        const appleCredential = provider.credential({
          idToken: credential.identityToken!,
          // rawNonce: credential.state ?? undefined,
        });

        console.log("Attempting to sign in with Firebase");
        const userCredential = await signInWithCredential(
          auth,
          appleCredential
        );
        console.log("Firebase sign in successful", userCredential.user.uid);

        await initializeApiUsage(userCredential.user);
        router.replace("/(tabs)");
      } else {
        console.error("No identity token received");
        Alert.alert(
          "Sign In Error",
          "Failed to receive identity token from Apple."
        );
      }
    } catch (error: any) {
      console.error("Apple sign-in error", error);

      if (error.code === "ERR_CANCELED") {
        console.log("User canceled Apple Sign In");
        // Optionally show an alert or handle canceled sign-in
      } else {
        let errorMessage =
          "An error occurred during Apple Sign In. Please try again.";

        if (error.code) {
          errorMessage += ` Error code: ${error.code}`;
        }

        if (error.message) {
          errorMessage += ` Message: ${error.message}`;
        }

        Alert.alert("Sign In Error", errorMessage);
      }
    }
  };

  // const revokeGoogleAccess = async () => {
  //   try {
  //     await GoogleSignin.revokeAccess();
  //     await GoogleSignin.signOut();
  //     await signOut(auth);
  //     // Delete user data from Firestore
  //     if (auth.currentUser) {
  //       const userDocRef = doc(db, "users", auth.currentUser.uid);
  //       await deleteDoc(userDocRef);
  //     }
  //     Alert.alert(
  //       "Access Revoked",
  //       "Your Google access has been revoked and all associated data has been removed."
  //     );
  //   } catch (error) {
  //     console.error("Error revoking access:", error);
  //     Alert.alert("Error", "Failed to revoke access. Please try again.");
  //   }
  // };

  return (
    <View className="flex-1 justify-center items-center bg-[#1B0112] p-8">
      <Text className="text-3xl font-bold text-[#E44EC3] mb-8">Sign In</Text>
      <TextInput
        className="w-full bg-[#5A0834] text-white p-4 rounded-lg mb-4"
        placeholder="Email"
        placeholderTextColor="#9D0B51"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="w-full bg-[#5A0834] text-white p-4 rounded-lg mb-6"
        placeholder="Password"
        placeholderTextColor="#9D0B51"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        className="w-full bg-[#E44EC3] p-4 rounded-lg mb-4"
        onPress={handleSignIn}
      >
        <Text className="text-white text-center font-bold">Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="w-full bg-white p-4 rounded-lg mb-4 flex-row justify-center items-center"
        onPress={handleGoogleSignIn}
      >
        <AntDesign
          name="google"
          size={24}
          color="#4285F4"
          style={{ marginRight: 10 }}
        />
        <Text className="text-[#4285F4] text-center font-bold">
          Sign In with Google
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-white p-3 rounded-md mt-2.5 flex-row items-center justify-center w-full"
        onPress={handleAppleSignIn}
      >
        <Text className="text-black font-medium">Sign in with Apple</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace("/sign-up")}>
        <Text className="text-[#E44EC3]">Don't have an account? Sign Up</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity
        className="w-full bg-red-500 p-4 rounded-lg mt-4"
        onPress={revokeGoogleAccess}
      >
        <Text className="text-white text-center font-bold">
          Revoke Google Access
        </Text>
      </TouchableOpacity> */}
    </View>
  );
}
