module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'react',
    'react-native',
    'react-hooks',
    'prettier',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',

    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'error',
    // '@typescript-eslint/prefer-nullish-coalescing': 'error', // Requires type info
    // '@typescript-eslint/prefer-optional-chain': 'error', // Requires type info

    // React specific rules
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // Using TypeScript instead
    'react/display-name': 'off',
    'react/no-unescaped-entities': 'error',

    // React Native specific rules
    'react-native/sort-styles': 'warn',
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'error',
    'react-native/no-inline-styles': 'off',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'error', // This will catch the text rendering error!

    // General JavaScript/TypeScript rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
  },
  env: {
    'react-native/react-native': true,
  },
};
