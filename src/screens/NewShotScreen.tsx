import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
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
  ShotFormData,
  shotToShotFormData,
  TASTING_TAGS,
  TastingTag,
} from '@types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useStore } from '../store/useStore';
import { colors } from '../themes/colors';

import {
  NumberInputField,
  TagChipsField,
  TextField,
  WaterTempField,
} from '../components/inputs';
import PickerField from '../components/inputs/forms/PickerField';
import { inputStyles } from '../components/inputs/styles';
import ErrorModal from '../components/modals/ErrorModal';
import SuccessModal from '../components/modals/SuccessModal';
import SvgIcon from '../components/SvgIcon';
import TastingNotes from '../components/TastingNotes';
import { calculateOverallScore } from '../utils/calculateOverallScore';
import { formatBeanName } from '../utils/formatBeanName';

type NewShotScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'NewShot'
>;
type NewShotScreenRouteProp = RouteProp<RootStackParamList, 'NewShot'>;

const initialFormData: Partial<ShotFormData> = {
  beanId: '',
  machineId: '',
  // extraction parameters
  grindSetting: '',
  dose_g: '',
  yield_g: '',
  ratio: '',
  // advanced parameters
  shotTime_s: '',
  waterTemp_C: '',
  preinfusion_s: '',
  // tasting notes
  acidity: 0,
  bitterness: 0,
  body: 0,
  aftertaste: 0,
  overallScore: 10,
  tastingTags: [],
  notes: '',
  isFavorite: false,
};

const NewShotScreen: React.FC = () => {
  const navigation = useNavigation<NewShotScreenNavigationProp>();
  const route = useRoute<NewShotScreenRouteProp>();
  const { beans, machines, createShot, shots } = useStore();

  const [formData, setFormData] = useState<ShotFormData>(
    initialFormData as ShotFormData
  );

  const [isLoading, setIsLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    isUpdate: boolean;
  }>({ visible: false, isUpdate: false });

  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: '' });

  const [currentScore, setCurrentScore] = useState<number>(10);

  // Update score whenever tasting notes change
  useEffect(() => {
    const score = calculateOverallScore(
      formData.acidity,
      formData.bitterness,
      formData.body,
      formData.aftertaste
    );
    setCurrentScore(score);
    // Update formData with the calculated score only if it's different
    setFormData(prev => {
      if (prev.overallScore !== score) {
        return { ...prev, overallScore: score };
      }
      return prev;
    });
  }, [
    formData.acidity,
    formData.bitterness,
    formData.body,
    formData.aftertaste,
  ]);

  const loadShotData = useCallback(
    async (
      shotId: string,
      beanIdOverride?: string,
      machineIdOverride?: string
    ) => {
      try {
        const shot = shots.find(s => s.id === shotId);
        if (shot) {
          // Don't set editingShotId - we want to create a new shot, not edit the existing one
          const shotFormData = shotToShotFormData(shot);
          if (beanIdOverride) {
            shotFormData.beanId = beanIdOverride;
          }
          if (machineIdOverride) {
            shotFormData.machineId = machineIdOverride;
          }
          setFormData(shotFormData);
        }
      } catch (error) {
        console.error('Failed to load shot data:', error);
      }
    },
    [shots]
  );

  useEffect(() => {
    // set the form data with the selected bean/machine ids if they are provided from the route params
    const { duplicateFrom, selectedBeanId, selectedMachineId } =
      route.params || {};

    if (!duplicateFrom) {
      // if we are not duplicating a shot, set the form data with the selected bean/machine ids from the route params

      let beanId = selectedBeanId || '';
      let machineId = selectedMachineId || '';

      if (!selectedBeanId && beans.length > 0) {
        // Check if we have a newly created bean (most recent one)
        const latestBean = [...beans].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        beanId = latestBean.id;
      }

      if (!selectedMachineId && machines.length > 0) {
        // Check if we have a newly created machine (most recent one)
        const latestMachine = [...machines].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        machineId = latestMachine.id;
      }

      setFormData(prev => ({
        ...prev,
        beanId,
        machineId,
      }));
      return;
    }

    if (duplicateFrom && shots.length > 0) {
      loadShotData(duplicateFrom, selectedBeanId, selectedMachineId);
      return;
    }
  }, [route.params, shots, loadShotData, beans, machines]);

  const handleCreateBean = () => {
    // Navigate to NewBean screen - auto-selection will handle the rest
    navigation.navigate('NewBean', { returnTo: 'NewShot' });
  };

  const handleCreateMachine = () => {
    // Navigate to NewMachine screen - auto-selection will handle the rest
    navigation.navigate('NewMachine', { returnTo: 'NewShot' });
  };

  const handleTastingTagsChange = (tags: string[]) => {
    // Allow both predefined TastingTag values and custom tags
    // Convert strings to TastingTag[] for type compatibility
    const validTastingTags = tags.map(tag => tag as TastingTag);
    handleInputChange('tastingTags', validTastingTags);
  };

  const handleInputChange = (
    field: keyof ShotFormData,
    value: string | boolean | number | TastingTag[]
  ) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Auto-calculate ratio when dose or yield changes
      if (field === 'dose_g' || field === 'yield_g') {
        const dose = parseFloat(
          field === 'dose_g' ? (value as string) : prev.dose_g
        );
        const yieldAmount = parseFloat(
          field === 'yield_g' ? (value as string) : prev.yield_g
        );

        if (dose > 0 && yieldAmount > 0) {
          const ratio = yieldAmount / dose;
          newData.ratio = ratio.toFixed(1);
        } else {
          newData.ratio = '';
        }
      }

      return newData;
    });
  };

  const handleSave = async () => {
    // Validate required fields
    if (
      !formData.beanId ||
      !formData.machineId ||
      !formData.dose_g ||
      !formData.yield_g ||
      !formData.grindSetting
    ) {
      setErrorModal({
        visible: true,
        message:
          'Please fill in all required fields (Bean, Machine, Dose, Yield, Grind Setting)',
      });

      return;
    }

    setIsLoading(true);
    try {
      await createShot(formData);
      setSuccessModal({ visible: true, isUpdate: false });
    } catch (error) {
      console.error('Failed to save shot:', error);
      setErrorModal({ visible: true, message: 'Failed to save shot' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModal({ visible: false, isUpdate: false });
    navigation.navigate('Shots');
  };

  const renderPicker = (
    label: string,
    value: string,
    options: Array<{ id: string; name: string }>,
    onValueChange: (value: string) => void,
    required: boolean = false,
    onCreateNew?: () => void,
    createButtonText?: string
  ) => (
    <PickerField
      label={label}
      value={value}
      options={options}
      onValueChange={onValueChange}
      required={required}
      onCreateNew={onCreateNew}
      createButtonText={createButtonText}
    />
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'position' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.form}>
          {route.params?.duplicateFrom && (
            <View style={styles.duplicateNotice}>
              <SvgIcon name='copy' size={20} />
              <Text style={styles.duplicateNoticeText}>
                This form is pre-filled with data from a previous shot. Modify
                the parameters as needed before saving.
              </Text>
            </View>
          )}
          <Text style={styles.sectionTitle}>Basic Information</Text>

          {renderPicker(
            'Bean',
            formData.beanId,
            beans.map(b => ({ id: b.id, name: formatBeanName(b) })),
            value => handleInputChange('beanId', value),
            true,
            handleCreateBean,
            'Create Bean'
          )}

          {renderPicker(
            'Machine',
            formData.machineId,
            machines.map(m => ({
              id: m.id,
              name:
                m.nickname ||
                `${m.brand} ${m.model}${m.grinder ? ` + ${m.grinder}` : ''}`,
            })),
            value => handleInputChange('machineId', value),
            true,
            handleCreateMachine,
            'Create Machine'
          )}

          <Text style={styles.sectionTitle}>Extraction Parameters</Text>

          <NumberInputField
            label='Grind Setting'
            value={formData.grindSetting}
            onChangeText={text => handleInputChange('grindSetting', text)}
            placeholder='10'
            required={true}
            step={1}
            minValue={0}
          />

          <NumberInputField
            label='Dose'
            value={formData.dose_g}
            onChangeText={text => handleInputChange('dose_g', text)}
            placeholder='18.0'
            required={true}
            unit='g'
            step={0.1}
            minValue={0}
          />

          <NumberInputField
            label='Yield'
            value={formData.yield_g}
            onChangeText={text => handleInputChange('yield_g', text)}
            placeholder='36.0'
            required={true}
            unit='g'
            step={0.1}
            minValue={0}
          />

          <TextField
            label='Ratio (auto-calculated)'
            value={formData.ratio}
            placeholder='Auto-calculated from dose/yield'
            readOnly={true}
            onChangeText={() => {}}
          />

          <Text style={styles.sectionTitle}>Advanced Parameters</Text>

          <NumberInputField
            label='Shot Time'
            value={formData.shotTime_s}
            onChangeText={text => handleInputChange('shotTime_s', text)}
            placeholder='30.0'
            required={false}
            unit='s'
            step={1}
            minValue={0}
          />

          <WaterTempField
            label='Water Temperature'
            value={formData.waterTemp_C}
            onChangeText={text => handleInputChange('waterTemp_C', text)}
            placeholder='93.0'
            step={0.1}
            minValue={0}
          />

          <NumberInputField
            label='Preinfusion Time'
            value={formData.preinfusion_s}
            onChangeText={text => handleInputChange('preinfusion_s', text)}
            placeholder='5.0'
            unit='s'
            step={1}
            minValue={0}
          />

          <Text style={styles.sectionTitle}>Tasting Notes</Text>
          <Text style={styles.sectionSubTitle}>
            Move the sliders to describe how your shot tastes. 0 means your
            ideal taste.
          </Text>

          <TastingNotes
            formData={formData}
            setFormData={data => setFormData(data as ShotFormData)}
          />

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Overall Tasting Score</Text>
            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreValue}>{currentScore}</Text>
              <Text style={styles.scoreMax}>/10</Text>
            </View>
            <Text style={styles.scoreDescription}>
              Score based on taste balance (closer to 0 = higher score)
            </Text>
          </View>

          <TagChipsField
            label='Additional Tasting Tags'
            value={formData.tastingTags}
            onChange={handleTastingTagsChange}
            suggestions={[...TASTING_TAGS]}
            allowCustom={true}
            subtitle='Add descriptive tags to complement your tasting notes above'
          />

          <TextField
            label='Notes'
            value={formData.notes}
            onChangeText={text => handleInputChange('notes', text)}
            placeholder='Additional tasting notes...'
            multiline={true}
            numberOfLines={4}
          />

          <View style={inputStyles.inputGroup}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => {
                handleInputChange('isFavorite', !formData.isFavorite);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <SvgIcon
                name={formData.isFavorite ? 'heart_filled' : 'heart'}
                size={28}
                useContentColor={true}
              />
              <Text style={styles.checkboxLabel}>Mark as favorite shot</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save Shot'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SuccessModal
        visible={successModal.visible}
        title={successModal.isUpdate ? 'Shot Updated!' : 'Shot Saved!'}
        message={
          successModal.isUpdate
            ? 'Your shot has been updated successfully!'
            : 'Your shot has been saved successfully!'
        }
        primaryButtonText='View Shots'
        onPrimaryPress={handleSuccessModalClose}
        icon='coffee'
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
  checkboxContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 8,
  },
  checkboxLabel: {
    color: colors.textDark,
    fontSize: 16,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  duplicateNotice: {
    alignItems: 'center',
    backgroundColor: colors.warningBackground,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
  },
  duplicateNoticeText: {
    color: colors.primary,
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  form: {
    padding: 16,
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
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: colors.hover,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  scoreDescription: {
    color: colors.textLight,
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
  },
  scoreDisplay: {
    alignItems: 'baseline',
    flexDirection: 'row',
    marginBottom: 8,
  },
  scoreLabel: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreMax: {
    color: colors.textMedium,
    fontSize: 20,
    fontWeight: '600',
  },
  scoreValue: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  sectionSubTitle: {
    color: colors.textMedium,
    fontSize: 14,
    marginBottom: 16,
    marginTop: -8,
  },
  sectionTitle: {
    color: colors.textDark,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 24,
  },
});

export default NewShotScreen;
