import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

interface DailyLimitModalProps {
  limitType: "api" | "AI";
  isVisible: boolean;
  onUpgrade: () => void;
  onClose: () => void;
}

export const DailyLimitModal: React.FC<DailyLimitModalProps> = ({
  limitType,
  isVisible,
  onUpgrade,
  onClose,
}) => {
  return (
    <Modal transparent={true} visible={isVisible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="m-5 bg-white rounded-3xl p-8 items-center shadow-lg">
          <Text className="mb-4 text-center text-lg font-bold">
            Daily {limitType} call limit reached
          </Text>
          <TouchableOpacity
            className="bg-blue-500 rounded-full py-3 px-6 mt-4 min-w-[200px]"
            onPress={onUpgrade}
          >
            <Text className="text-white font-bold text-center">
              Upgrade to Pro
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-500 rounded-full py-3 px-6 mt-4 min-w-[200px]"
            onPress={onClose}
          >
            <Text className="text-white font-bold text-center">
              Try Again Tomorrow
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
