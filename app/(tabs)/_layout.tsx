import React, { useState, useEffect } from "react";
import {
  useColorScheme as _useColorScheme,
  Alert,
  View,
  Text,
} from "react-native";
import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "@/constants/Colors";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { clearExtractedTexts, clearDatabase } from "@/lib/db";
import { signOut } from "firebase/auth";
import { MaterialIcons } from "@expo/vector-icons";
import { auth } from "@/firebase/config";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

// Custom hook for theme management
function useColorScheme() {
  const systemColorScheme = _useColorScheme();
  const [colorScheme, setColorScheme] = useState(systemColorScheme);

  useEffect(() => {
    setColorScheme(systemColorScheme);
  }, [systemColorScheme]);

  const toggleColorScheme = () => {
    setColorScheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { colorScheme, toggleColorScheme };
}

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // User is signed in, you can do something here if needed
      } else {
        router.replace("/sign-in");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Error", "Failed to log out");
    }
  };

  const handleClearHistory = async () => {
    if (auth.currentUser) {
      try {
        await clearExtractedTexts(auth.currentUser.uid);
        Alert.alert("Success", "History cleared successfully");
      } catch (error) {
        console.error("Error clearing history:", error);
        Alert.alert("Error", "Failed to clear history");
      }
    }
  };

  // const handleClearDatabase = async () => {
  //   try {
  //     await clearDatabase();
  //     Alert.alert("Success", "Database cleared successfully");
  //   } catch (error) {
  //     console.error("Error clearing database:", error);
  //     Alert.alert("Error", "Failed to clear database");
  //   }
  // };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },

        headerStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
        headerTintColor: Colors[colorScheme ?? "light"].text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Menu>
              <MenuTrigger>
                <MaterialIcons
                  name="account-circle"
                  size={28}
                  color={Colors[colorScheme ?? "light"].text}
                  className="mr-4"
                />
              </MenuTrigger>
              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    marginTop: 30,
                    backgroundColor: Colors[colorScheme ?? "light"].background,
                  },
                }}
              >
                <View className="w-56 rounded-lg shadow-md overflow-hidden">
                  {user && (
                    <View className="flex-row items-center p-4 border-b border-gray-200">
                      <MaterialIcons
                        name="person"
                        size={24}
                        color={Colors[colorScheme ?? "light"].text}
                      />
                      <Text
                        className="ml-2 font-bold text-sm"
                        style={{ color: Colors[colorScheme ?? "light"].text }}
                      >
                        {user.email}
                      </Text>
                    </View>
                  )}
                  <MenuOption onSelect={handleLogOut}>
                    <View className="flex-row items-center p-4">
                      <MaterialIcons
                        name="logout"
                        size={20}
                        color={Colors[colorScheme ?? "light"].text}
                      />
                      <Text
                        className="ml-2 text-base"
                        style={{ color: Colors[colorScheme ?? "light"].text }}
                      >
                        Log Out
                      </Text>
                    </View>
                  </MenuOption>
                  <MenuOption onSelect={handleClearHistory}>
                    <View className="flex-row items-center p-4">
                      <MaterialIcons
                        name="delete-sweep"
                        size={20}
                        color={Colors[colorScheme ?? "light"].text}
                      />
                      <Text
                        className="ml-2 text-base"
                        style={{ color: Colors[colorScheme ?? "light"].text }}
                      >
                        Clear History
                      </Text>
                    </View>
                  </MenuOption>
                  {/* <MenuOption onSelect={handleClearDatabase}>
                    <View className="flex-row items-center p-4">
                      <MaterialIcons
                        name="delete-forever"
                        size={20}
                        color={Colors[colorScheme ?? "light"].text}
                      />
                      <Text className="ml-2 text-base" style={{ color: Colors[colorScheme ?? "light"].text }}>
                        Clear Database
                      </Text>
                    </View>
                  </MenuOption> */}
                </View>
              </MenuOptions>
            </Menu>
          ),
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
    </Tabs>
  );
}
