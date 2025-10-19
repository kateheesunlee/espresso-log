import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  AROMA_TAGS,
  createBeanDateEntry,
  getLastBeanDate,
  normalizeDateForStorage,
  RoastLevel,
} from '@types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useStore } from '../store/useStore';
import { colors } from '../themes/colors';
import { showImagePickerOptions } from '../utils/imageUtils';

import Avatar from '../components/Avatar';
import BeanFreshnessForm from '../components/BeanManager/BeanFreshnessForm';
import { DEFAULT_EXPIRATION_PERIOD_WEEKS } from '../components/BeanManager/constants';
import { FormField, TagChipsField, TextField } from '../components/inputs';
import RoastingSlider from '../components/inputs/sliders/RoastingSlider';
import ErrorModal from '../components/modals/ErrorModal';
import SuccessModal from '../components/modals/SuccessModal';
import SvgIcon from '../components/SvgIcon';

type NewBeanScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'NewBean'
>;
type NewBeanScreenRouteProp = RouteProp<RootStackParamList, 'NewBean'>;

interface BeanFormData {
  name: string;
  origin: string;
  process: string;
  roastLevel: RoastLevel;
  aromaTags: string[];
  roastDate: string;
  dateType: 'roasting' | 'opening';
  expirationPeriodWeeks: number;
  imageUri?: string;
}

const NewBeanScreen: React.FC = () => {
  const navigation = useNavigation<NewBeanScreenNavigationProp>();
  const route = useRoute<NewBeanScreenRouteProp>();
  const { createBean, updateBean, beans } = useStore();

  const [formData, setFormData] = useState<BeanFormData>({
    name: '',
    origin: '',
    process: '',
    roastLevel: 'Medium',
    aromaTags: [],
    roastDate: '',
    dateType: 'roasting',
    expirationPeriodWeeks: 2, // Default to 2 weeks
    imageUri: '',
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

  useEffect(() => {
    // If editing an existing bean, load its data
    if (route.params?.beanId) {
      const bean = beans.find(b => b.id === route.params.beanId);
      if (bean) {
        setEditingBeanId(bean.id);
        // Get the last date entry from the bean's dates array
        const lastDateEntry = getLastBeanDate(bean);
        const lastDate = lastDateEntry?.date || bean.roastDate || '';
        const lastDateType = lastDateEntry?.type || 'roasting';

        setFormData({
          name: bean.name,
          origin: bean.origin || '',
          process: bean.process || '',
          roastLevel: bean.roastLevel || 'Medium',
          aromaTags: bean.aromaTags || [],
          roastDate: lastDate,
          dateType: lastDateType,
          expirationPeriodWeeks:
            bean.expirationPeriodWeeks || DEFAULT_EXPIRATION_PERIOD_WEEKS,
          imageUri: bean.imageUri || '',
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
            label='Bean Name'
            value={formData.name}
            onChangeText={text =>
              setFormData(prev => ({ ...prev, name: text }))
            }
            placeholder='e.g., Ethiopian Yirgacheffe'
            required={true}
          />

          <TextField
            label='Origin'
            value={formData.origin}
            onChangeText={text =>
              setFormData(prev => ({ ...prev, origin: text }))
            }
            placeholder='e.g., Ethiopia, Colombia, Brazil'
          />

          <TextField
            label='Process'
            value={formData.process}
            onChangeText={text =>
              setFormData(prev => ({ ...prev, process: text }))
            }
            placeholder='e.g., Washed, Natural, Honey'
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
  },
});

export default NewBeanScreen;
