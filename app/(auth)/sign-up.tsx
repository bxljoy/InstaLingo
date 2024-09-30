import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Alert } from "react-native";
import { Text } from "@/components/Themed";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../firebase/config";
import { useRouter } from "expo-router";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Send email verification
      await sendEmailVerification(userCredential.user);

      Alert.alert(
        "Verification Email Sent",
        "Please check your email to verify your account. You won't be able to sign in until your email is verified.",
        [{ text: "OK", onPress: () => router.replace("/sign-in") }]
      );
    } catch (error: any) {
      let errorMessage = "An error occurred during sign up. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already in use. Please use a different email or sign in.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address. Please enter a valid email.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
      }

      Alert.alert("Sign Up Error", errorMessage);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-6">
      <Text className="text-3xl font-bold text-black mb-8">Sign Up</Text>
      <TextInput
        className="w-full bg-white text-black p-4 rounded-lg mb-4 border border-gray-300"
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="w-full bg-white text-black p-4 rounded-lg mb-4 border border-gray-300"
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        className="w-full bg-white text-black p-4 rounded-lg mb-6 border border-gray-300"
        placeholder="Confirm Password"
        placeholderTextColor="#999"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity
        className="w-full bg-blue-500 p-4 rounded-lg mb-4"
        onPress={handleSignUp}
      >
        <Text
          className="text-white text-center font-bold text-lg"
          testID="sign-up-button"
        >
          Sign Up
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace("/sign-in")}>
        <Text className="text-blue-500 text-base">
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
}
