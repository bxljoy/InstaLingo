import React, { useState, useEffect } from "react";
import { useColorScheme as _useColorScheme, Alert } from "react-native";
import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "@/constants/Colors";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { clearDatabase, clearExtractedTexts } from "@/lib/db";
import { MaterialIcons } from "@expo/vector-icons";

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

  const handleClearDatabase = async () => {
    try {
      await clearDatabase();
      Alert.alert("Success", "Database cleared successfully");
    } catch (error) {
      console.error("Error clearing database:", error);
      Alert.alert("Error", "Failed to clear database");
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearExtractedTexts();
      Alert.alert("Success", "History cleared successfully");
    } catch (error) {
      console.error("Error clearing history:", error);
      Alert.alert("Error", "Failed to clear history");
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
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
                  name="clear-all"
                  size={25}
                  color={Colors[colorScheme ?? "light"].text}
                  style={{ marginRight: 15 }}
                />
              </MenuTrigger>
              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    marginTop: 30,
                    backgroundColor: Colors[colorScheme ?? "light"].background,
                    borderRadius: 8,
                    padding: 8,
                  },
                }}
              >
                <MenuOption
                  onSelect={handleClearDatabase}
                  text="Clear Database"
                  customStyles={{
                    optionText: {
                      color: Colors[colorScheme ?? "light"].text,
                      fontSize: 16,
                      padding: 10,
                    },
                  }}
                />
                <MenuOption
                  onSelect={handleClearHistory}
                  text="Clear History"
                  customStyles={{
                    optionText: {
                      color: Colors[colorScheme ?? "light"].text,
                      fontSize: 16,
                      padding: 10,
                    },
                  }}
                />
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
