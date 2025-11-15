# Espresso Log

### Track, refine, and master your espresso extractions.

A React Native app for logging espresso shots with detailed extraction parameters and tasting notes.

## Features

- 📱 Log detailed espresso shot parameters
- 🎯 Track extraction variables (grind size, dose, yield, time, temperature)
- ⭐ Rate and review your shots
- 📝 Add tasting notes and observations
- 📊 View shot history and statistics
- 🏷️ Organize beans and machines
- 📸 Take photos of your beans and machines
- 💾 Local data storage with SQLite

## Screenshots

_Screenshots will be added after App Store submission_

## Installation

### Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/kateheesunlee/espresso-log.git
   cd espresso-log
   ```

2. Install dependencies:

   ```bash
   cd EspressoLog
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Run on iOS:

   ```bash
   npm run ios
   ```

5. Run on Android:
   ```bash
   npm run android
   ```

## Build & Publish (EAS)

### Prerequisites

- Install the Expo CLI and log in: `npm install -g eas-cli` then `eas login`
- Make sure your Expo account has access to the Apple Developer and Google Play credentials you plan to use.
- Increment the app version in `app.config.ts` (and any native store metadata) before building.

### Build

1. Configure the project if this is your first build:
   ```bash
   eas build:configure
   ```
2. Trigger a build:
   - iOS: `eas build --platform ios`
   - Android: `eas build --platform android`
3. Monitor build progress from the Expo dashboard or the CLI output. Download the binaries once complete.

### Submit

1. Ensure you have the latest binary from the previous step.
2. Submit to the stores using Expo submit:
   - App Store Connect: `eas submit --platform ios`
   - Google Play Console: `eas submit --platform android`
3. Complete the remaining store metadata/review steps directly in App Store Connect or Google Play Console.

## Tech Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **React Navigation** for navigation
- **SQLite** for local data storage
- **Zustand** for state management
- **React Native SVG** for custom icons

## App Store

Available on the App Store: https://apps.apple.com/us/app/espresso-log/id6753608360

## License

Private project - All rights reserved.
