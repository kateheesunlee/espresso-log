import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../themes/colors';
import SvgIcon from './SvgIcon';

interface PhotoGalleryProps {
  imageUris?: string[];
  fallbackImageUri?: string;
  height?: number;
  onRemovePhoto?: (index: number) => void;
  editable?: boolean;
}

const GALLERY_HEIGHT = 250;

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  imageUris,
  fallbackImageUri,
  height = GALLERY_HEIGHT,
  onRemovePhoto,
  editable = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use shot images if available, otherwise fall back to bean image
  const displayImages = imageUris && imageUris.length > 0 ? imageUris : [];
  const shouldShowFallback = displayImages.length === 0 && fallbackImageUri;
  const allImagesToDisplay = shouldShowFallback
    ? [fallbackImageUri]
    : displayImages;

  if (allImagesToDisplay.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex(prev =>
      prev === 0 ? allImagesToDisplay.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex(prev =>
      prev === allImagesToDisplay.length - 1 ? 0 : prev + 1
    );
  };

  const currentImageUri = allImagesToDisplay[currentIndex];
  const isFallback = shouldShowFallback;

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: currentImageUri }}
          style={styles.image}
          resizeMode='cover'
        />

        {/* Previous Button */}
        {allImagesToDisplay.length > 1 && (
          <TouchableOpacity
            style={[styles.navigationButton, styles.previousButton]}
            onPress={handlePrevious}
          >
            <Text style={styles.navigationText}>‹</Text>
          </TouchableOpacity>
        )}

        {/* Next Button */}
        {allImagesToDisplay.length > 1 && (
          <TouchableOpacity
            style={[styles.navigationButton, styles.nextButton]}
            onPress={handleNext}
          >
            <Text style={styles.navigationText}>›</Text>
          </TouchableOpacity>
        )}

        {/* Remove Button (only for shot photos, not fallback) */}
        {editable && !isFallback && onRemovePhoto && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemovePhoto(currentIndex)}
          >
            <SvgIcon name='close' size={20} color={colors.white} />
          </TouchableOpacity>
        )}

        {/* Fallback Badge */}
        {isFallback && (
          <View style={styles.fallbackBadge}>
            <Text style={styles.fallbackText}>Bean Photo</Text>
          </View>
        )}
      </View>

      {/* Pagination Indicators */}
      {allImagesToDisplay.length > 1 && (
        <View style={styles.pagination}>
          <View style={styles.dotsContainer}>
            {allImagesToDisplay.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.dot, index === currentIndex && styles.activeDot]}
                onPress={() => setCurrentIndex(index)}
              />
            ))}
          </View>
          <Text style={styles.pageText}>
            {currentIndex + 1} / {allImagesToDisplay.length}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  activeDot: {
    backgroundColor: colors.primary,
  },
  container: {
    backgroundColor: colors.hover,
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  dot: {
    backgroundColor: colors.textMedium,
    borderRadius: 4,
    height: 8,
    marginHorizontal: 4,
    width: 8,
  },
  dotsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  fallbackBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    bottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
    right: 12,
  },
  fallbackText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  image: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  navigationButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    top: '50%',
    width: 40,
    zIndex: 10,
  },
  navigationText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  nextButton: {
    right: 12,
  },
  pageText: {
    color: colors.textMedium,
    fontSize: 12,
    marginLeft: 8,
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  previousButton: {
    left: 12,
  },
  removeButton: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: 12,
    width: 40,
    zIndex: 10,
  },
});

export default PhotoGallery;
