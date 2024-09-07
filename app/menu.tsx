import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";

export default function MenuScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      <View style={styles.menuItem}>
        <Text style={styles.menuText}>Clear Database</Text>
      </View>

      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      <View style={styles.menuItem}>
        <Text style={styles.menuText}>Clear History</Text>
      </View>

      {/* Use a light status bar on iOS to account for the black space above the menu */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  menuItem: {
    width: "80%",
    padding: 15,
    backgroundColor: "#5A0834",
    borderRadius: 8,
    marginVertical: 10,
  },
  menuText: {
    color: "#E44EC3",
    fontSize: 16,
    textAlign: "center",
  },
});
