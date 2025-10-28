import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

import {
  AROMA_TAGS,
  createBeanDateEntry,
  getLastBeanDate,
  normalizeDateForStorage,
  Process,
  RoastLevel,
} from '@types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useStore } from '../store/useStore';
import { colors } from '../themes/colors';
import { showImagePickerOptions } from '../utils/imageUtils';

import Avatar from '../components/Avatar';
import BeanFreshnessForm from '../components/BeanManager/BeanFreshnessForm';
import { DEFAULT_EXPIRATION_PERIOD_WEEKS } from '../components/BeanManager/constants';
import {
  FormField,
  RangeNumberField,
  SingleSelectChipsField,
  TagChipsField,
  TextField,
} from '../components/inputs';
import RoastingSlider from '../components/inputs/sliders/RoastingSlider';
import ErrorModal from '../components/modals/ErrorModal';
import SuccessModal from '../components/modals/SuccessModal';
import SvgIcon from '../components/SvgIcon';

const processPlaceholders: Record<Process, string> = {
  Washed: 'e.g., Double-washed, Long fermentation, Kenya-style',
  Natural: 'e.g., Drying on raised beds, Anaerobic Natural, 72h fermentation',
  Honey: 'e.g., Yellow, Red, or Black honey process',
  Anaerobic: 'e.g., Carbonic maceration, Lactic, Thermal shock',
  'Wet-hulled': 'e.g., Giling Basah (Sumatra wet-hulled)',
  Other: 'e.g., Yeast fermentation, Koji, Experimental process',
};

type NewBeanScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'NewBean'
>;
type NewBeanScreenRouteProp = RouteProp<RootStackParamList, 'NewBean'>;

interface BeanFormData {
  name: string;
  roaster: string;
  roastLevel: RoastLevel;
  aromaTags: string[];
  // advanced fields
  origin: string;
  producer: string;
  varietal: string;
  altitudeMin: string;
  altitudeMax: string;
  process: Process | '';
  processDetail: string;

  // flattened bean date entry
  dateType: 'roasting' | 'opening';
  roastDate: string; // roast or opening date
  expirationPeriodWeeks: number;
  // additional fields
  buyUrl: string;
  notes: string;
  imageUri?: string;
  isFavorite: boolean;
}

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const NewBeanScreen: React.FC = () => {
  const navigation = useNavigation<NewBeanScreenNavigationProp>();
  const route = useRoute<NewBeanScreenRouteProp>();
  const { createBean, updateBean, beans } = useStore();

  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  const rotateValue = useRef(new Animated.Value(0)).current;

  const [formData, setFormData] = useState<BeanFormData>({
    name: '',
    roaster: '',
    roastLevel: 'Medium',
    aromaTags: [],

    // advanced fields start
    origin: '',
    producer: '',
    altitudeMin: '',
    altitudeMax: '',
    varietal: '',
    process: '',
    processDetail: '',

    // flattened bean date entry
    roastDate: '',
    dateType: 'roasting',
    expirationPeriodWeeks: 2, // Default to 2 weeks

    // additional fields
    buyUrl: '',
    notes: '',
    imageUri: '',
    isFavorite: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [editingBeanId, setEditingBeanId] = useState<string | null>(null);

  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    isUpdate: boolean;
  }>({ visible: false, isUpdate: false });

  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: '' });

  const toggleAdvancedSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsAdvancedExpanded(!isAdvancedExpanded);

    // Animate chevron rotation
    Animated.timing(rotateValue, {
      toValue: isAdvancedExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const rotateInterpolation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  useEffect(() => {
    // If editing an existing bean, load its data
    if (route.params?.beanId) {
      const bean = beans.find(b => b.id === route.params.beanId);
      if (bean) {
        setEditingBeanId(bean.id);
        // Get the last date entry from the bean's dates array
        const lastDateEntry = getLastBeanDate(bean);
        const lastDate = lastDateEntry?.date || '';
        const lastDateType = lastDateEntry?.type || 'roasting';

        setFormData({
          // basic fields
          name: bean.name,
          roaster: bean.roaster || '',
          roastLevel: bean.roastLevel || 'Medium',
          aromaTags: bean.aromaTags || [],
          // advanced fields
          origin: bean.origin || '',
          producer: bean.producer || '',
          altitudeMin: bean.altitudeMin || '',
          altitudeMax: bean.altitudeMax || '',
          varietal: bean.varietal || '',
          process: bean.process || '',
          processDetail: bean.processDetail || '',
          // additional fields
          buyUrl: bean.buyUrl || '',
          notes: bean.notes || '',
          imageUri: bean.imageUri || '',
          isFavorite: bean.isFavorite || false,
          // flattened bean date entry
          roastDate: lastDate,
          dateType: lastDateType,
          expirationPeriodWeeks:
            bean.expirationPeriodWeeks || DEFAULT_EXPIRATION_PERIOD_WEEKS,
        });
      }
    }
  }, [route.params?.beanId, beans]);

  const handleAromaTagsChange = (tags: string[]) => {
    // Accept any strings for custom aroma tags
    setFormData(prev => ({ ...prev, aromaTags: tags }));
  };

  const handleDateChange = (date: Date) => {
    const normalizedDate = normalizeDateForStorage(date);
    setFormData(prev => ({ ...prev, roastDate: normalizedDate }));
  };

  const handleDateTypeChange = (dateType: 'roasting' | 'opening') => {
    setFormData(prev => ({ ...prev, dateType }));
  };

  const handleImageCapture = async () => {
    try {
      const result = await showImagePickerOptions();

      if (!result.cancelled && result.uri) {
        setFormData(prev => ({ ...prev, imageUri: result.uri }));
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      setErrorModal({
        visible: true,
        message: 'Failed to capture image. Please try again.',
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setErrorModal({ visible: true, message: 'Bean name is required' });
      return;
    }

    setIsLoading(true);
    try {
      // Handle dates array properly
      let dates = [];

      if (editingBeanId) {
        // When updating an existing bean, preserve existing dates
        const existingBean = beans.find(b => b.id === editingBeanId);
        dates = existingBean?.dates || [];

        // If a new date is provided, add it to the dates array
        if (formData.roastDate) {
          const dateEntry = createBeanDateEntry(
            formData.roastDate,
            formData.dateType
          );
          dates.push(dateEntry);
        }
      } else {
        // When creating a new bean, create initial date entry if provided
        const dateEntry = createBeanDateEntry(
          formData.roastDate || new Date().toISOString(),
          formData.dateType
        );
        dates.push(dateEntry);
      }

      const beanData = {
        id: editingBeanId || `bean-${Date.now()}`,
        userId: 'default-user',
        ...formData,
        dates,
        createdAt: editingBeanId
          ? beans.find(b => b.id === editingBeanId)?.createdAt ||
            new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingBeanId) {
        await updateBean(beanData);
        setSuccessModal({ visible: true, isUpdate: true });
      } else {
        await createBean(beanData);
        setSuccessModal({ visible: true, isUpdate: false });
      }
    } catch (error) {
      console.error(error);
      setErrorModal({ visible: true, message: 'Failed to save bean' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModal({ visible: false, isUpdate: false });
    if (route.params?.returnTo === 'NewShot') {
      navigation.goBack();
    } else {
      navigation.navigate('Shots', {
        screen: 'Beans',
      } as any);
    }
  };

  const processDetailPlaceholder = useMemo(
    () => processPlaceholders[formData.process as Process],
    [formData.process]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Bean Information</Text>

          {/* Image Section */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionLabel}>Bean Photo</Text>
            <View style={styles.imageContainer}>
              <Avatar
                imageUri={formData.imageUri}
                fallbackIcon='bean'
                size={80}
                onPress={handleImageCapture}
              />
              <TouchableOpacity
                style={styles.imageButton}
                onPress={handleImageCapture}
              >
                <SvgIcon name='camera' size={20} />
                <Text style={styles.imageButtonText}>
                  {formData.imageUri ? 'Change Photo' : 'Add Photo'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TextField
            label='Roaster'
            value={formData.roaster}
            onChangeText={text =>
              setFormData(prev => ({ ...prev, roaster: text }))
            }
            placeholder='e.g., Blue Bottle, Stumptown, Onyx, etc.'
            required={true}
          />

          <TextField
            label='Bean Name'
            value={formData.name}
            onChangeText={text =>
              setFormData(prev => ({ ...prev, name: text }))
            }
            placeholder=''
            required={true}
          />

          <FormField label='Roast Level'>
            <RoastingSlider
              value={formData.roastLevel || 'Medium'}
              onValueChange={value =>
                setFormData(prev => ({ ...prev, roastLevel: value }))
              }
            />
          </FormField>

          <TagChipsField
            label='Aroma Tags'
            value={formData.aromaTags}
            onChange={handleAromaTagsChange}
            suggestions={[...AROMA_TAGS]}
            allowCustom={true}
          />

          <View>
            <TouchableOpacity
              style={styles.advancedHeader}
              onPress={toggleAdvancedSection}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>Advanced Information</Text>
              <Animated.View
                style={{
                  ...styles.chevronContainer,
                  transform: [{ rotate: rotateInterpolation }],
                }}
              >
                <Ionicons
                  name='chevron-down'
                  size={24}
                  color={colors.textDark}
                />
              </Animated.View>
            </TouchableOpacity>

            {isAdvancedExpanded && (
              <View>
                {/* advanced fields start */}
                <TextField
                  label='Origin (Country / Region)'
                  value={formData.origin}
                  onChangeText={text =>
                    setFormData(prev => ({ ...prev, origin: text }))
                  }
                  placeholder='e.g., Ethiopia, Colombia, Brazil'
                />

                <TextField
                  label='Producer / Farm'
                  value={formData.producer}
                  onChangeText={text =>
                    setFormData(prev => ({ ...prev, producer: text }))
                  }
                  placeholder='e.g., Hacienda La Esmeralda, Finca El Injerto, etc.'
                />

                <TextField
                  label='Varietal(s)'
                  value={formData.varietal}
                  onChangeText={text =>
                    setFormData(prev => ({ ...prev, varietal: text }))
                  }
                  placeholder='e.g., Geisha, Caturra, Bourbon, Blend, etc.'
                />
                <RangeNumberField
                  label='Altitude (masl)'
                  unit='m'
                  minValue={formData.altitudeMin}
                  maxValue={formData.altitudeMax}
                  onMinValueChange={text =>
                    setFormData(prev => ({ ...prev, altitudeMin: text }))
                  }
                  onMaxValueChange={text =>
                    setFormData(prev => ({ ...prev, altitudeMax: text }))
                  }
                  step={100}
                  placeholder='1500'
                />

                <SingleSelectChipsField
                  label='Process'
                  value={formData.process}
                  onChange={process =>
                    setFormData(prev => ({
                      ...prev,
                      process: process as Process,
                    }))
                  }
                  suggestions={[
                    Process.Washed,
                    Process.Natural,
                    Process.Honey,
                    Process.Anaerobic,
                    Process['Wet-hulled'],
                    Process.Other,
                  ]}
                  allowCustom={false}
                />

                {formData.process && (
                  <TextField
                    label='Process detail (Optional)'
                    value={formData.processDetail}
                    onChangeText={text =>
                      setFormData(prev => ({ ...prev, processDetail: text }))
                    }
                    placeholder={processDetailPlaceholder || ''}
                  />
                )}
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>Bean Freshness</Text>
          <BeanFreshnessForm
            initialDate={
              formData.roastDate ? new Date(formData.roastDate) : new Date()
            }
            initialDateType={formData.dateType}
            onDateChange={handleDateChange}
            onDateTypeChange={handleDateTypeChange}
            expirationPeriodWeeks={formData.expirationPeriodWeeks}
            onExpirationPeriodChange={value =>
              setFormData(prev => ({
                ...prev,
                expirationPeriodWeeks: value,
              }))
            }
            roastLevel={formData.roastLevel}
          />

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading
                ? 'Saving...'
                : editingBeanId
                  ? 'Update Bean'
                  : 'Save Bean'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SuccessModal
        visible={successModal.visible}
        title={successModal.isUpdate ? 'Bean Updated!' : 'Bean Saved!'}
        message={
          successModal.isUpdate
            ? 'Your bean has been updated successfully!'
            : 'Your bean has been saved successfully!'
        }
        primaryButtonText={
          route.params?.returnTo === 'NewShot'
            ? 'Continue Recording Shot'
            : 'View Beans'
        }
        onPrimaryPress={handleSuccessModalClose}
        icon='bean'
      />

      <ErrorModal
        visible={errorModal.visible}
        message={errorModal.message}
        onButtonPress={() => setErrorModal({ visible: false, message: '' })}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  advancedHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chevronContainer: {
    marginBottom: 16,
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  form: {
    padding: 16,
  },
  imageButton: {
    alignItems: 'center',
    backgroundColor: colors.hover,
    borderColor: colors.borderLight,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  imageButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  imageContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  imageSection: {
    marginBottom: 20,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginBottom: 32,
    marginTop: 24,
    padding: 16,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  sectionLabel: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.textDark,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 24,
  },
});

export default NewBeanScreen;
