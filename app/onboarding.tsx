import Onboarding from "react-native-onboarding-swiper";
import { Text, TouchableOpacity } from "react-native";
import { useRef } from "react";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OnBoardingScreen() {
  const onboardingRef = useRef<Onboarding>(null);
  const router = useRouter();

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem("onboardingComplete", "true");
    router.replace("/sign-in");
  };

  const doneButton = () => {
    return (
      <TouchableOpacity
        className="text-white px-4 py-2 rounded-md"
        onPress={handleOnboardingComplete}
      >
        <Text className="text-white">Done</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Onboarding
      ref={onboardingRef}
      onDone={handleOnboardingComplete}
      onSkip={handleOnboardingComplete}
      DoneButtonComponent={doneButton}
      pages={[
        {
          backgroundColor: "#a7f3d0",
          image: (
            <LottieView
              source={require("@/assets/animations/scanning.json")}
              className="w-72 h-96"
              autoPlay
              loop
            />
          ),
          title: (
            <Text className="text-3xl font-bold text-gray-800 text-center mb-6">
              Image Recognition
            </Text>
          ),
          subtitle: (
            <Text className="text-center text-lg font-bold text-gray-500 leading-relaxed px-14">
              Extract text from images you capture or upload
            </Text>
          ),
        },
        {
          backgroundColor: "#fef3c7",
          image: (
            <LottieView
              source={require("@/assets/animations/meeting.json")}
              className="w-72 h-96"
              autoPlay
              loop
            />
          ),
          title: (
            <Text className="text-3xl font-bold text-gray-800 text-center mb-6">
              Text Translation
            </Text>
          ),
          subtitle: (
            <Text className="text-center text-lg font-bold text-gray-500 leading-relaxed px-14">
              Translate original texts into your target language
            </Text>
          ),
        },
        {
          backgroundColor: "#a78bfa",
          image: (
            <LottieView
              source={require("@/assets/animations/shoutout.json")}
              className="w-72 h-96"
              autoPlay
              loop
            />
          ),
          title: (
            <Text className="text-3xl font-bold text-gray-800 text-center mb-6">
              Text-to-Speech
            </Text>
          ),
          subtitle: (
            <Text className="text-center text-lg font-bold text-gray-500 leading-relaxed px-14">
              Practice pronunciation with text-to-speech
            </Text>
          ),
        },
      ]}
    />
  );
}
