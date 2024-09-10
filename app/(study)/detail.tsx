import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  SafeAreaView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { textToSpeech } from "@/lib/textToSpeech";
import { Audio } from "expo-av";

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
      const newSound = await textToSpeech(textToSpeak, languageCode);
      setSound(newSound);

      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      await newSound.playAsync();
    } catch (error) {
      console.error("Error playing audio:", error);
      setSound(null);
      setPlayingText(null);
      setIsBuffering(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1B0112]">
      <ScrollView className="flex-1 px-4 py-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex flex-row items-center gap-2 mb-4"
        >
          <FontAwesome name="arrow-left" size={24} color="#E44EC3" />
          <Text className="text-lg text-[#E44EC3]">Back</Text>
        </TouchableOpacity>

        <View className="bg-[#5A0834] rounded-lg p-4 mb-6 relative">
          <View className="flex-row justify-between items-center mb-2 bg-[#5A0834]">
            <Text className="text-lg text-[#E44EC3] ">Original Text:</Text>
            <TouchableOpacity
              onPress={() => copyToClipboard(text as string, setCopiedOriginal)}
              className="bg-[#9D0B51] p-2 rounded-full"
            >
              <MaterialIcons
                name={copiedOriginal ? "check" : "content-copy"}
                size={24}
                color="#E44EC3"
              />
            </TouchableOpacity>
          </View>
          <Text className="text-white mb-8">{text}</Text>
          <View className="absolute bottom-2 right-6 bg-[#5A0834]">
            <TouchableOpacity
              onPress={() => pronounceText(text as string, "en-US", "original")}
              disabled={isBuffering}
            >
              <FontAwesome
                name={
                  playingText === "original" ? "stop-circle-o" : "play-circle-o"
                }
                size={32}
                color={isBuffering ? "#999" : "#E44EC3"}
              />
            </TouchableOpacity>
          </View>
        </View>
        {translatedText && (
          <View className="bg-[#5A0834] rounded-lg p-4 relative mb-8">
            <View className="flex-row justify-between items-center mb-2 bg-[#5A0834]">
              <Text className="text-lg text-[#E44EC3]">Translated Text:</Text>
              <TouchableOpacity
                onPress={() =>
                  copyToClipboard(translatedText as string, setCopiedTranslated)
                }
                className="bg-[#9D0B51] p-2 rounded-full"
              >
                <MaterialIcons
                  name={copiedTranslated ? "check" : "content-copy"}
                  size={24}
                  color="#E44EC3"
                />
              </TouchableOpacity>
            </View>
            <Text className="text-white mb-8">{translatedText}</Text>
            <View className="absolute bottom-2 right-6 bg-[#5A0834]">
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
                  color={isBuffering ? "#999" : "#E44EC3"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </SafeAreaView>
  );
}
