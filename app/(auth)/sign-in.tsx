import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Alert } from "react-native";
import { Text } from "@/components/Themed";
import {
  signInWithEmailAndPassword,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "../../firebase/config";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider } from "firebase/auth";
import Constants from "expo-constants";

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

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Error", error.message);
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
      console.error("Error signing in with Google:", error);
      Alert.alert("Error", error.message);
    }
  };

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
      <TouchableOpacity onPress={() => router.replace("/sign-up")}>
        <Text className="text-[#E44EC3]">Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}
