import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  SafeAreaView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "@/components/Themed";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { textToSpeech } from "@/lib/textToSpeech";
import { Audio } from "expo-av";
import { apiWrapper } from "@/lib/apiWrapper";

export default function DetailScreen() {
  const { text, translatedText } = useLocalSearchParams();
  const router = useRouter();
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedTranslated, setCopiedTranslated] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playingText, setPlayingText] = useState<
    "original" | "translated" | null
  >(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  useEffect(() => {
    return () => {
      // Cleanup function to unload sound when component unmounts
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const onPlaybackStatusUpdate = useCallback((playbackStatus: any) => {
    if (!playbackStatus.isLoaded) {
      // Update your UI for the unloaded state
      setIsBuffering(false);
      setPlayingText(null);
      if (playbackStatus.error) {
        console.log(
          `Encountered a fatal error during playback: ${playbackStatus.error}`
        );
      }
    } else {
      // Update your UI for the loaded state
      setIsBuffering(playbackStatus.isBuffering);

      if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
        // The player has just finished playing and will stop.
        setSound(null);
        setPlayingText(null);
        setIsBuffering(false);
      }
    }
  }, []);

  const copyToClipboard = async (
    textToCopy: string,
    setCopied: (value: boolean) => void
  ) => {
    await Clipboard.setStringAsync(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pronounceText = async (
    textToSpeak: string,
    languageCode: string,
    textType: "original" | "translated"
  ) => {
    if (sound) {
      // If there's an existing sound, stop and unload it
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setPlayingText(null);
      setIsBuffering(false);
      return;
    }

    setIsBuffering(true);
    setPlayingText(textType);

    try {
      const newSound = await apiWrapper(() =>
        textToSpeech(textToSpeak, languageCode)
      );
      setSound(newSound);

      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      if (newSound) {
        newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        await newSound.playAsync();
        await newSound.setRateAsync(playbackSpeed, true);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setSound(null);
      setPlayingText(null);
      setIsBuffering(false);
    }
  };

  const handleSpeedChange = async (newSpeed: number) => {
    setPlaybackSpeed(newSpeed);
    if (sound) {
      await sound.setRateAsync(newSpeed, true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 py-6">
        {Platform.OS === "ios" && (
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex flex-row items-center gap-2 mb-4"
          >
            <FontAwesome name="arrow-left" size={24} color="#007AFF" />
            <Text className="text-lg text-blue-500">Back</Text>
          </TouchableOpacity>
        )}
        <View className="bg-gray-100 rounded-lg p-4 mb-6 relative">
          <View className="flex-row justify-between items-center mb-2 bg-gray-200 rounded-lg p-4">
            <Text className="text-lg text-gray-800">Original Text:</Text>
            <TouchableOpacity
              onPress={() => copyToClipboard(text as string, setCopiedOriginal)}
              className="bg-blue-500 p-2 rounded-full"
            >
              <MaterialIcons
                name={copiedOriginal ? "check" : "content-copy"}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600 mb-8">{text}</Text>
          <View className="absolute bottom-2 right-6 bg-gray-200 rounded-lg">
            <TouchableOpacity
              onPress={() => pronounceText(text as string, "en-US", "original")}
              disabled={isBuffering}
            >
              <FontAwesome
                name={
                  playingText === "original" ? "stop-circle-o" : "play-circle-o"
                }
                size={32}
                color={isBuffering ? "#999" : "#007AFF"}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View className="bg-gray-100 rounded-lg p-4 mb-6">
          <Text className="text-lg text-gray-800 mb-2">Playback Speed:</Text>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={0.5}
            maximumValue={2}
            value={playbackSpeed}
            onValueChange={handleSpeedChange}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#000000"
            thumbTintColor="#007AFF"
          />
          <Text className="text-gray-600 text-center">
            {playbackSpeed.toFixed(2)}x
          </Text>
        </View>
        {translatedText && (
          <View className="bg-gray-100 rounded-lg p-4 relative mb-8">
            <View className="flex-row justify-between items-center mb-2 bg-gray-200 rounded-lg p-4">
              <Text className="text-lg text-gray-800">Translated Text:</Text>
              <TouchableOpacity
                onPress={() =>
                  copyToClipboard(translatedText as string, setCopiedTranslated)
                }
                className="bg-blue-500 p-2 rounded-full"
              >
                <MaterialIcons
                  name={copiedTranslated ? "check" : "content-copy"}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
            <Text className="text-gray-600 mb-8">{translatedText}</Text>
            <View className="absolute bottom-2 right-6 bg-gray-200 rounded-lg">
              <TouchableOpacity
                onPress={() =>
                  pronounceText(translatedText as string, "en-US", "translated")
                }
                disabled={isBuffering}
              >
                <FontAwesome
                  name={
                    playingText === "translated"
                      ? "stop-circle-o"
                      : "play-circle-o"
                  }
                  size={32}
                  color={isBuffering ? "#999" : "#007AFF"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      <StatusBar style={Platform.OS === "ios" ? "dark" : "auto"} />
    </SafeAreaView>
  );
}
