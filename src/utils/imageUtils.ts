import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export interface ImagePickerResult {
  uri: string;
  cancelled: boolean;
}

export const requestCameraPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting camera permissions:', error);
    return false;
  }
};

export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting media library permissions:', error);
    return false;
  }
};

export const pickImageFromCamera = async (): Promise<ImagePickerResult> => {
  try {
    const hasPermission = await requestCameraPermissions();

    if (!hasPermission) {
      return { uri: '', cancelled: true };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for avatar
      quality: 0.8,
      base64: true, // Get base64 directly from ImagePicker
    });

    const asset = result.assets?.[0];
    if (asset) {
      // Use base64 directly from ImagePicker if available, otherwise use URI
      const base64Uri = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      return {
        uri: base64Uri,
        cancelled: result.canceled,
      };
    }

    return {
      uri: '',
      cancelled: result.canceled,
    };
  } catch (error) {
    console.error('Error picking image from camera:', error);
    return { uri: '', cancelled: true };
  }
};

export const pickImageFromLibrary = async (): Promise<ImagePickerResult> => {
  try {
    const hasPermission = await requestMediaLibraryPermissions();

    if (!hasPermission) {
      return { uri: '', cancelled: true };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for avatar
      quality: 0.8,
      base64: true, // Get base64 directly from ImagePicker
    });

    const asset = result.assets?.[0];
    if (asset) {
      // Use base64 directly from ImagePicker if available, otherwise use URI
      const base64Uri = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      return {
        uri: base64Uri,
        cancelled: result.canceled,
      };
    }

    return {
      uri: '',
      cancelled: result.canceled,
    };
  } catch (error) {
    console.error('Error picking image from library:', error);
    return { uri: '', cancelled: true };
  }
};

export const showImagePickerOptions = async (): Promise<ImagePickerResult> => {
  // For now, we'll just use the camera. In a real app, you might want to show an action sheet
  // with options for camera vs library
  return await pickImageFromCamera();
};

// Note: convertImageToBase64 is no longer needed since ImagePicker provides base64 directly
export const getImageUriFromBase64 = (base64: string): string => {
  return base64; // Base64 strings can be used directly as URIs in React Native
};
