import React, { useState, useEffect } from "react";
import { Pressable, useColorScheme as _useColorScheme } from "react-native";
import { Link, Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

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

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

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
          headerLeft: () => (
            <Pressable
              onPress={toggleColorScheme}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
                marginLeft: 15,
              })}
            >
              <MaterialCommunityIcons
                name={
                  colorScheme === "dark" ? "weather-sunny" : "weather-night"
                }
                size={25}
                color={Colors[colorScheme ?? "light"].text}
              />
            </Pressable>
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? "light"].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
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
