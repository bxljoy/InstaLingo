import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Alert } from "react-native";
import { Text } from "@/components/Themed";
import { createUserWithEmailAndPassword } from "firebase/auth";
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
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#1B0112] p-8">
      <Text className="text-3xl font-bold text-[#E44EC3] mb-8">Sign Up</Text>
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
        className="w-full bg-[#5A0834] text-white p-4 rounded-lg mb-4"
        placeholder="Password"
        placeholderTextColor="#9D0B51"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        className="w-full bg-[#5A0834] text-white p-4 rounded-lg mb-6"
        placeholder="Confirm Password"
        placeholderTextColor="#9D0B51"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity
        className="w-full bg-[#E44EC3] p-4 rounded-lg mb-4"
        onPress={handleSignUp}
      >
        <Text className="text-white text-center font-bold">Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace("/sign-in")}>
        <Text className="text-[#E44EC3]">Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}
