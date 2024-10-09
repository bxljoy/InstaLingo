import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = "Loading...",
}) => {
  return (
    <View className="absolute top-1/2 left-1/3 inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <View className="bg-white p-6 rounded-lg shadow-lg">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="mt-4 text-lg font-semibold text-center text-gray-800">
          {message}
        </Text>
      </View>
    </View>
  );
};

export default LoadingIndicator;
