import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { Share } from 'react-native';
import { captureRef } from 'react-native-view-shot';

export interface ShotShareOptions {
  saveToLibrary?: boolean;
  shareMessage?: string;
  shareTitle?: string;
}

/**
 * Captures a shot share card view and generates a shareable image
 */
export const captureShotImage = async (
  viewRef: React.RefObject<any>
): Promise<string> => {
  try {
    if (!viewRef.current) {
      throw new Error('View reference is not available');
    }

    console.log('Attempting to capture view...');

    // Add delay to ensure the component is fully rendered
    await new Promise(resolve => setTimeout(resolve, 800));

    // Try capturing with different parameters
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1.0,
      width: 420,
      height: 420,
      result: 'base64',
    });

    if (!uri) {
      throw new Error('Capture returned empty result');
    }

    console.log('Image captured successfully, URI length:', uri.length);
    return uri;
  } catch (error) {
    console.error('Error capturing shot image:', error);
    throw new Error(
      `Failed to capture image: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Saves a shot image to the device's camera roll
 */
export const saveShotToLibrary = async (imageUri: string): Promise<void> => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Media library permission not granted');
    }

    // If it's a base64 string, convert to file first
    let fileUri = imageUri;

    if (imageUri.startsWith('data:') || !imageUri.startsWith('file://')) {
      // Extract base64 data if it has a data URI prefix
      const base64Data = imageUri.startsWith('data:image/png;base64,')
        ? imageUri.replace('data:image/png;base64,', '')
        : imageUri;

      // Write to a temporary file with proper extension
      const fileName = `shot_${Date.now()}.png`;
      const filePath = `${(FileSystem as any).cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      fileUri = filePath;
    }

    const asset = await MediaLibrary.createAssetAsync(fileUri);
    await MediaLibrary.createAlbumAsync('EspressoLog', asset, false);
  } catch (error) {
    console.error('Error saving shot to library:', error);
    throw error;
  }
};

/**
 * Shares a shot image to Instagram or other apps
 */
export const shareShotImage = async (
  imageUri: string,
  options: ShotShareOptions = {}
): Promise<void> => {
  try {
    const { saveToLibrary, shareMessage, shareTitle } = options;

    let fileUriToShare = imageUri;

    // If it's base64, write to file first for sharing
    if (!imageUri.startsWith('file://')) {
      const base64Data = imageUri.startsWith('data:image/png;base64,')
        ? imageUri.replace('data:image/png;base64,', '')
        : imageUri;

      const fileName = `shot_share_${Date.now()}.png`;
      const filePath = `${(FileSystem as any).cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      fileUriToShare = filePath;
    }

    // Optionally save to library first
    if (saveToLibrary) {
      await saveShotToLibrary(fileUriToShare);
    }

    // Share the image
    await Share.share({
      url: fileUriToShare,
      title: shareTitle || 'My Espresso Shot',
      message:
        shareMessage ||
        'Check out my espresso shot! Logged with EspressoLog 📸☕',
    });
  } catch (error) {
    console.error('Error sharing shot image:', error);
    throw error;
  }
};

/**
 * Complete flow: capture, optionally save, and share
 */
export const captureAndShareShot = async (
  viewRef: React.RefObject<any>,
  options: ShotShareOptions = {}
): Promise<void> => {
  try {
    // 1. Capture the image
    const imageUri = await captureShotImage(viewRef);

    // 2. Share (with optional save to library)
    await shareShotImage(imageUri, options);
  } catch (error) {
    console.error('Error in capture and share flow:', error);
    throw error;
  }
};
