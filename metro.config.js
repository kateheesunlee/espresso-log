// metro.config.js
const { getDefaultConfig } = require("expo/metro-config"); // Expo
const path = require("path");
const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

// Add path alias for @types
config.resolver.alias = {
  "@types": path.resolve(__dirname, "src/types"),
};

module.exports = config;
