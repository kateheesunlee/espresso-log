import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { useStore } from './src/store/useStore';
import { ThemeProvider, useTheme } from './src/themes/ThemeContext';
import { useColors } from './src/themes/colors';

function AppContent() {
  const { initializeApp, isLoading } = useStore();
  const { theme } = useTheme();
  const colors = useColors();

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={{ flex: 1, overflow: 'scroll', backgroundColor: colors.bgLight }}
      >
        <AppNavigator />
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor={colors.primary} />
      </View>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
