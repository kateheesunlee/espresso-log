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

import { RootStackParamList } from '../navigation/AppNavigator';
import { useStore } from '../store/useStore';
import { colors } from '../themes/colors';
import { showImagePickerOptions } from '../utils/imageUtils';

import Avatar from '../components/Avatar';
import { TextField } from '../components/inputs';
import TypeAheadInput from '../components/inputs/forms/TypeAheadInput';
import ErrorModal from '../components/modals/ErrorModal';
import SuccessModal from '../components/modals/SuccessModal';
import SvgIcon from '../components/SvgIcon';
import brandsSeed from '../data/brands.json';
import grindersSeed from '../data/grinders.json';
import modelsSeed from '../data/models.json';
import { database } from '../database/UniversalDatabase';
import {
  createUserBrand,
  createUserGrinder,
  createUserMachineModel,
} from '../utils/seedDataHelpers';

type NewMachineScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'NewMachine'
>;
type NewMachineScreenRouteProp = RouteProp<RootStackParamList, 'NewMachine'>;

interface MachineFormData {
  brand: string;
  model: string;
  nickname: string;
  grinder: string;
  imageUri?: string;
}

const NewMachineScreen: React.FC = () => {
  const navigation = useNavigation<NewMachineScreenNavigationProp>();
  const route = useRoute<NewMachineScreenRouteProp>();
  const { createMachine, updateMachine, machines } = useStore();

  const [formData, setFormData] = useState<MachineFormData>({
    brand: '',
    model: '',
    nickname: '',
    grinder: '',
    imageUri: '',
  });

  const [brandId, setBrandId] = useState<string>('');
  const [allBrands, setAllBrands] = useState<
    Array<{ id: string; name: string; aliases: string[] }>
  >([]);
  const [allGrinders, setAllGrinders] = useState<
    Array<{ id: string; name: string; aliases: string[] }>
  >([]);
  const [allModels, setAllModels] = useState<
    Array<{ id: string; brandId: string; name: string; aliases: string[] }>
  >([]);

  // Load data from database
  useEffect(() => {
    const loadDatabaseData = async () => {
      try {
        const [dbBrands, dbGrinders, dbModels] = await Promise.all([
          database.getBrands(),
          database.getGrinders(),
          database.getMachineModels(),
        ]);

        // Combine seed data with database data
        setAllBrands([...brandsSeed, ...dbBrands]);
        setAllGrinders([...grindersSeed, ...dbGrinders]);
        setAllModels(dbModels);
      } catch (error) {
        console.error('Error loading database data:', error);
      }
    };

    loadDatabaseData();
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);

  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    isUpdate: boolean;
  }>({ visible: false, isUpdate: false });

  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: '' });

  useEffect(() => {
    // If editing an existing machine, load its data
    if (route.params?.machineId) {
      const machine = machines.find(m => m.id === route.params?.machineId);
      if (machine) {
        setEditingMachineId(machine.id);
        setFormData({
          brand: machine.brand,
          model: machine.model,
          nickname: machine.nickname || '',
          grinder: machine.grinder || '',
          imageUri: machine.imageUri || '',
        });
        // Find brand ID if possible
        const brand = brandsSeed.find(
          (b: { name: string; id: string }) => b.name === machine.brand
        );
        if (brand) {
          setBrandId(brand.id);
        }
      }
    }
  }, [route.params?.machineId, machines]);

  const handleImageCapture = async () => {
    try {
      const result = await showImagePickerOptions();

      if (!result.cancelled && result.uri) {
        setFormData(prev => ({ ...prev, imageUri: result.uri }));
      }
    } catch {
      // Error already logged by showImagePickerOptions
      setErrorModal({
        visible: true,
        message: 'Failed to capture image. Please try again.',
      });
    }
  };

  // Handlers for creating new items
  const handleCreateBrand = async (name: string) => {
    const newItem = createUserBrand(name);
    await database.createBrand(newItem);
    // Reload brands to include the new item
    const dbBrands = await database.getBrands();
    setAllBrands([...brandsSeed, ...dbBrands]);
  };

  const handleCreateGrinder = async (name: string) => {
    const newItem = createUserGrinder(name);
    await database.createGrinder(newItem);
    // Reload grinders to include the new item
    const dbGrinders = await database.getGrinders();
    setAllGrinders([...grindersSeed, ...dbGrinders]);
  };

  const handleCreateModel = async (name: string) => {
    if (!brandId) return;
    const newItem = createUserMachineModel(brandId, name);
    await database.createMachineModel(newItem);
    // Reload models to include the new item
    const dbModels = await database.getMachineModels();
    setAllModels(dbModels);
  };

  const handleSave = async () => {
    if (!formData.brand.trim() || !formData.model.trim()) {
      setErrorModal({ visible: true, message: 'Brand and model are required' });
      return;
    }

    setIsLoading(true);
    try {
      const machineData = {
        id: editingMachineId || `machine-${Date.now()}`,
        userId: 'default-user',
        ...formData,
        createdAt: editingMachineId
          ? machines.find(m => m.id === editingMachineId)?.createdAt ||
            new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingMachineId) {
        await updateMachine(machineData);
        setSuccessModal({ visible: true, isUpdate: true });
      } else {
        await createMachine(machineData);
        setSuccessModal({ visible: true, isUpdate: false });
      }
    } catch {
      setErrorModal({ visible: true, message: 'Failed to save machine' });
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
        screen: 'Machines',
      } as never);
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
          <Text style={styles.sectionTitle}>Machine Information</Text>

          {/* Image Section */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionLabel}>Machine Photo</Text>
            <View style={styles.imageContainer}>
              <Avatar
                imageUri={formData.imageUri}
                fallbackIcon='coffeemaker'
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

          <TypeAheadInput
            label='Brand'
            value={formData.brand}
            options={allBrands}
            onCreateNewItem={handleCreateBrand}
            onChangeText={async text => {
              setFormData(prev => ({ ...prev, brand: text, model: '' }));
              // Find brand ID from all brands (seed + DB)
              const brand = allBrands.find(
                (b: { name: string; id: string }) => b.name === text
              );
              setBrandId(brand?.id || '');
            }}
            placeholder='e.g., Breville, Gaggia, La Marzocco'
            required={true}
          />

          <TypeAheadInput
            label='Model'
            value={formData.model}
            options={
              brandId
                ? [
                    ...modelsSeed.filter(m => m.brandId === brandId),
                    ...allModels.filter(m => m.brandId === brandId),
                  ]
                : []
            }
            onCreateNewItem={handleCreateModel}
            onChangeText={text =>
              setFormData(prev => ({ ...prev, model: text }))
            }
            placeholder='e.g., Bambino Plus, Classic Pro, Linea Mini'
            required={true}
          />

          <TypeAheadInput
            label='Grinder'
            value={formData.grinder}
            options={allGrinders}
            onCreateNewItem={handleCreateGrinder}
            onChangeText={text =>
              setFormData(prev => ({ ...prev, grinder: text }))
            }
            placeholder='e.g., Fellow Ode Gen 2, Eureka Mignon Specialita'
            subtitle='Specify the grinder model name if using a separate grinder'
          />

          <TextField
            label='Nickname (Optional)'
            value={formData.nickname}
            onChangeText={text =>
              setFormData(prev => ({ ...prev, nickname: text }))
            }
            placeholder='e.g., My Daily Driver, Office Machine'
          />

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading
                ? 'Saving...'
                : editingMachineId
                  ? 'Update Machine'
                  : 'Save Machine'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SuccessModal
        visible={successModal.visible}
        title={successModal.isUpdate ? 'Machine Updated!' : 'Machine Saved!'}
        message={
          successModal.isUpdate
            ? 'Your machine has been updated successfully!'
            : 'Your machine has been saved successfully!'
        }
        primaryButtonText={
          route.params?.returnTo === 'NewShot'
            ? 'Continue Recording Shot'
            : 'View Machines'
        }
        onPrimaryPress={handleSuccessModalClose}
        icon='coffeemaker'
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

export default NewMachineScreen;
