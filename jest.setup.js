// Jest setup file for global test configuration

// Mock React Native's Animated library
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock Expo modules if needed
jest.mock("expo-file-system", () => ({
  documentDirectory: "file://mock-document-directory/",
  cacheDirectory: "file://mock-cache-directory/",
}));

// Suppress console warnings in tests (optional)
// global.console = {
//   ...console,
//   warn: jest.fn(),
//   error: jest.fn(),
// };
