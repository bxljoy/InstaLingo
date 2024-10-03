import React, { useState, useEffect } from "react";
import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "@/constants/Colors";
import {
  useColorScheme,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { checkSubscriptionStatus } from "@/lib/revenueCat";
import { presentPaywall } from "@/lib/presentPaywall";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

function ProStatusButton() {
  const [isPro, setIsPro] = useState(false);
  const [isCheckingPro, setIsCheckingPro] = useState(true);
  const colorScheme = useColorScheme();

  useEffect(() => {
    checkProStatus();
  }, []);

  const checkProStatus = async () => {
    setIsCheckingPro(true);
    const status = await checkSubscriptionStatus();
    setIsPro(status);
    setIsCheckingPro(false);
  };

  const handleUpgrade = async () => {
    const purchased = await presentPaywall();
    if (purchased) {
      setIsPro(true);
    }
  };

  if (isCheckingPro) {
    return (
      <ActivityIndicator
        size="small"
        color={Colors[colorScheme ?? "light"].text}
        style={{ marginRight: 10 }}
      />
    );
  }

  if (isPro) {
    return (
      <View style={{ marginRight: 10 }}>
        <FontAwesome name="star" size={24} color="#FFD700" />
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={handleUpgrade}
      style={{
        backgroundColor: "rgba(0,0,0,0.1)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
        marginRight: 10,
      }}
    >
      <Text
        style={{
          color: colorScheme === "dark" ? "white" : "black",
          fontWeight: "600",
        }}
      >
        Upgrade
      </Text>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
        headerTintColor: Colors[colorScheme ?? "light"].text,
        tabBarShowLabel: true,
        headerRight: () => <ProStatusButton />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          // headerRight: () => <ProStatusButton />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="history" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
