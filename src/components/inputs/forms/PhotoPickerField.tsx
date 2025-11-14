import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '../../../themes/colors';
import {
  pickImageFromCamera,
  pickImageFromLibrary,
} from '../../../utils/imageUtils';
import SvgIcon from '../../SvgIcon';

interface PhotoPickerFieldProps {
  label: string;
  imageUris?: string[];
  onPhotosChange: (imageUris: string[]) => void;
  maxPhotos?: number;
}

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 3; // 3 photos per row, accounting for padding

const PhotoPickerField: React.FC<PhotoPickerFieldProps> = ({
  label,
  imageUris = [],
  onPhotosChange,
  maxPhotos = 3,
}) => {
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  const handleAddPhotoFromCamera = async () => {
    try {
      const result = await pickImageFromCamera();
      if (!result.cancelled && result.uri && imageUris.length < maxPhotos) {
        onPhotosChange([...imageUris, result.uri]);
      }
      setShowPhotoOptions(false);
    } catch (error) {
      console.error('Error picking photo from camera:', error);
    }
  };

  const handleAddPhotoFromLibrary = async () => {
    try {
      const result = await pickImageFromLibrary();
      if (!result.cancelled && result.uri && imageUris.length < maxPhotos) {
        onPhotosChange([...imageUris, result.uri]);
      }
      setShowPhotoOptions(false);
    } catch (error) {
      console.error('Error picking photo from library:', error);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newUris = imageUris.filter((_, i) => i !== index);
    onPhotosChange(newUris);
  };

  const canAddMore = imageUris.length < maxPhotos;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.subtitle}>
        Add shot photos to document your espresso (up to {maxPhotos})
      </Text>

      {/* Photo Grid */}
      <View style={styles.photoGrid}>
        {imageUris.map((uri, index) => (
          <View key={index} style={styles.photoWrapper}>
            <Image source={{ uri }} style={styles.photo} resizeMode='cover' />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleRemovePhoto(index)}
            >
              <SvgIcon name='close' size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Photo Button */}
        {canAddMore && (
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={() => setShowPhotoOptions(!showPhotoOptions)}
          >
            <SvgIcon name='plus' size={32} color={colors.primary} />
            <Text style={styles.addPhotoText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Photo Count */}
      {imageUris.length > 0 && (
        <Text style={styles.photoCount}>
          {imageUris.length} of {maxPhotos} photos added
        </Text>
      )}

      {/* Photo Options Modal */}
      {showPhotoOptions && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleAddPhotoFromCamera}
          >
            <SvgIcon name='camera' size={24} color={colors.primary} />
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleAddPhotoFromLibrary}
          >
            <SvgIcon name='image' size={24} color={colors.primary} />
            <Text style={styles.optionText}>Choose from Library</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => setShowPhotoOptions(false)}
          >
            <SvgIcon name='close' size={24} color={colors.textMedium} />
            <Text style={styles.optionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  addPhotoButton: {
    alignItems: 'center',
    backgroundColor: colors.hover,
    borderColor: colors.borderLight,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: PHOTO_SIZE,
    justifyContent: 'center',
    marginBottom: 12,
    marginRight: 12,
    width: PHOTO_SIZE,
  },
  addPhotoText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  container: {
    marginBottom: 16,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    borderRadius: 4,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    top: 4,
    width: 24,
  },
  label: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 16,
    width: '100%',
  },
  optionText: {
    color: colors.textDark,
    fontSize: 16,
    marginLeft: 12,
  },
  optionsContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  photo: {
    borderRadius: 8,
    height: PHOTO_SIZE,
    width: PHOTO_SIZE,
  },
  photoCount: {
    color: colors.textMedium,
    fontSize: 12,
    marginTop: 4,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  photoWrapper: {
    borderRadius: 8,
    marginBottom: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  subtitle: {
    color: colors.textMedium,
    fontSize: 13,
    marginTop: -2,
  },
});

export default PhotoPickerField;
