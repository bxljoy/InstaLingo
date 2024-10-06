import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Text } from "@/components/Themed";
import {
  signInWithEmailAndPassword,
  signInWithCredential,
  OAuthProvider,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider } from "firebase/auth";
import Constants from "expo-constants";
import * as AppleAuthentication from "expo-apple-authentication";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        Constants.expoConfig?.extra?.webClientId || process.env.WEB_CLIENT_ID,
    });
  }, []);

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        Alert.alert(
          "Email Not Verified",
          "Please verify your email before signing in. Would you like us to send another verification email?",
          [
            {
              text: "Yes, send email",
              onPress: async () => {
                await sendEmailVerification(user);
                Alert.alert(
                  "Verification Email Sent",
                  "Please check your inbox and verify your email."
                );
              },
            },
            {
              text: "No, thanks",
              style: "cancel",
            },
          ]
        );
        return;
      }

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
          await signInWithCredential(auth, credential);
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
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        const provider = new OAuthProvider("apple.com");
        const appleCredential = provider.credential({
          idToken: credential.identityToken,
        });
        await signInWithCredential(auth, appleCredential);
        router.replace("/(tabs)");
      } else {
        Alert.alert(
          "Sign In Error",
          "Failed to receive identity token from Apple."
        );
      }
    } catch (error: any) {
      if (error.code !== "ERR_CANCELED") {
        let errorMessage =
          "An error occurred during Apple Sign In. Please try again.";
        if (error.code) {
          errorMessage += ` Error code: ${error.code}`;
        }
        if (error.message) {
          errorMessage += ` Message: ${error.message}`;
        }
        // Alert.alert("Sign In Error", errorMessage);
      }
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-6">
      <Text className="text-3xl font-bold text-black mb-8">Sign In</Text>
      <TextInput
        className="w-full bg-gray-100 text-black p-3 rounded-lg mb-4"
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="w-full bg-gray-100 text-black p-3 rounded-lg mb-6"
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        className="w-full bg-blue-500 p-3 rounded-lg mb-4"
        onPress={handleSignIn}
      >
        <Text
          className="text-white text-center font-semibold"
          testID="sign-in-button"
        >
          Sign In
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="w-full border border-blue-500 p-3 rounded-lg mb-4 flex-row justify-center items-center"
        onPress={handleGoogleSignIn}
      >
        <AntDesign
          name="google"
          size={20}
          color="#4285F4"
          style={{ marginRight: 8 }}
        />
        <Text className="text-blue-500 text-center font-semibold">
          Sign in with Google
        </Text>
      </TouchableOpacity>
      {Platform.OS === "ios" && (
        <TouchableOpacity
          className="w-full border border-blue-500 p-3 rounded-lg mb-4 flex-row justify-center items-center"
          onPress={handleAppleSignIn}
        >
          <AntDesign
            name="apple1"
            size={20}
            color="#000"
            style={{ marginRight: 8 }}
          />
          <Text className="text-blue-500 text-center font-semibold">
            Sign in with Apple
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={() => router.replace("/sign-up")}
        className="mt-4"
      >
        <Text className="text-blue-500">Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}
