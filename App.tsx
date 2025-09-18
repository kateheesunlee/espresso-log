import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useStore } from "./src/store/useStore";
import { colors } from "./src/themes/colors";

export default function App() {
  const { initializeApp, isLoading } = useStore();

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style="light" backgroundColor={colors.primary} />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
