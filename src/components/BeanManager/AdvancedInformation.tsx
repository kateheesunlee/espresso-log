import { Process } from '@types';
import React, { useEffect, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import originsSeed from '../../data/origins.json';
import producersSeed from '../../data/producers.json';
import varietalsSeed from '../../data/varietals.json';
import { database } from '../../database/UniversalDatabase';
import { colors } from '../../themes/colors';
import { createUserProducer } from '../../utils/seedDataHelpers';
import ExpandableChevron from '../ExpandableChevron';
import { FormField, RangeNumberField, SingleSelectChipsField } from '../inputs';
import TypeAheadInput from '../inputs/forms/TypeAheadInput';
import CreateProducerModal from '../modals/CreateProducerModal';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const processPlaceholders: Record<Process, string> = {
  Washed: 'e.g., Double-washed, Long fermentation, Kenya-style',
  Natural: 'e.g., Drying on raised beds, Anaerobic Natural, 72h fermentation',
  Honey: 'e.g., Yellow, Red, or Black honey process',
  Anaerobic: 'e.g., Carbonic maceration, Lactic, Thermal shock',
  'Wet-hulled': 'e.g., Giling Basah (Sumatra wet-hulled)',
  Other: 'e.g., Yeast fermentation, Koji, Experimental process',
};

interface AdvancedInformationProps {
  formData: {
    origin: string;
    producer: string;
    varietal: string;
    altitudeMin: string;
    altitudeMax: string;
    process: Process | '';
    processDetail: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const AdvancedInformation: React.FC<AdvancedInformationProps> = ({
  formData,
  setFormData,
}) => {
  const hasAdvancedData = !!(
    formData.origin ||
    formData.producer ||
    formData.varietal ||
    formData.altitudeMin ||
    formData.altitudeMax ||
    formData.process ||
    formData.processDetail
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(hasAdvancedData);

  useEffect(() => {
    setIsExpanded(hasAdvancedData);
  }, [hasAdvancedData]);

  // Data loading
  const [allOrigins, setAllOrigins] = useState<
    Array<{ id: string; name: string; aliases: string[] }>
  >([]);
  const [allProducers, setAllProducers] = useState<
    Array<{ id: string; name: string; aliases: string[] }>
  >([]);
  const [allVarietals, setAllVarietals] = useState<
    Array<{ id: string; name: string; aliases: string[] }>
  >([]);
  const [isProducerModalVisible, setIsProducerModalVisible] = useState(false);
  const [pendingProducerName, setPendingProducerName] = useState('');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [dbProducers] = await Promise.all([
          database.getProducers(),
          // Origins and varietals don't have database tables
        ]);

        setAllOrigins(originsSeed);
        setAllProducers([...producersSeed, ...dbProducers]);
        setAllVarietals(varietalsSeed);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const handleCreateProducer = async (data: {
    name: string;
    aliases: string[];
    country: string;
    region: string;
  }) => {
    const nameToUse = data.name.trim() || pendingProducerName;
    const newProducer = createUserProducer(nameToUse);

    // Add optional fields if provided
    if (data.aliases.length > 0) {
      newProducer.aliases = data.aliases;
    }
    if (data.country) {
      newProducer.country = data.country;
    }
    if (data.region) {
      newProducer.region = data.region;
    }

    await database.createProducer(newProducer);
    // Reload producers
    const dbProducers = await database.getProducers();
    setAllProducers([...producersSeed, ...dbProducers]);
    // Set the newly created producer in the form
    setFormData((prev: any) => ({ ...prev, producer: newProducer.name }));
  };

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const processDetailPlaceholder =
    processPlaceholders[formData.process as Process] || '';

  return (
    <View>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>Advanced Information</Text>
        <View style={styles.chevronContainer}>
          <ExpandableChevron isExpanded={isExpanded} />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View>
          <TypeAheadInput
            label='Origin (Country / Region)'
            value={formData.origin}
            onChangeText={text =>
              setFormData((prev: any) => ({ ...prev, origin: text }))
            }
            options={allOrigins}
            placeholder='e.g., Ethiopia - Yirgacheffe, Colombia - Huila'
          />

          <TypeAheadInput
            label='Producer / Farm'
            value={formData.producer}
            onChangeText={text =>
              setFormData((prev: any) => ({ ...prev, producer: text }))
            }
            options={allProducers}
            onCreateNewItem={async (name: string) => {
              setPendingProducerName(name);
              setIsProducerModalVisible(true);
            }}
            placeholder='e.g., Hacienda La Esmeralda, Finca El Injerto, etc.'
          />

          <TypeAheadInput
            label='Varietal(s)'
            value={formData.varietal}
            onChangeText={text =>
              setFormData((prev: any) => ({ ...prev, varietal: text }))
            }
            options={allVarietals}
            placeholder='e.g., Geisha, Caturra, Bourbon, Blend, etc.'
          />

          <RangeNumberField
            label='Altitude (masl)'
            unit='m'
            minValue={formData.altitudeMin}
            maxValue={formData.altitudeMax}
            onMinValueChange={text =>
              setFormData((prev: any) => ({ ...prev, altitudeMin: text }))
            }
            onMaxValueChange={text =>
              setFormData((prev: any) => ({ ...prev, altitudeMax: text }))
            }
            step={100}
            placeholder='1500'
          />

          <SingleSelectChipsField
            label='Process'
            value={formData.process}
            onChange={value =>
              setFormData((prev: any) => ({
                ...prev,
                process: value as Process,
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
            <FormField label='Process detail (Optional)'>
              <TextInput
                style={styles.input}
                value={formData.processDetail}
                onChangeText={text =>
                  setFormData((prev: any) => ({ ...prev, processDetail: text }))
                }
                placeholder={processDetailPlaceholder || ''}
              />
            </FormField>
          )}
        </View>
      )}

      <CreateProducerModal
        visible={isProducerModalVisible}
        pendingName={pendingProducerName}
        onRequestClose={() => {
          setIsProducerModalVisible(false);
          setPendingProducerName('');
        }}
        onSave={async (data: {
          name: string;
          aliases: string[];
          country: string;
          region: string;
        }) => {
          await handleCreateProducer(data);
          setIsProducerModalVisible(false);
          setPendingProducerName('');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chevronContainer: {
    marginBottom: 16,
    marginTop: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    padding: 12,
  },
  title: {
    color: colors.textDark,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 24,
  },
});

export default AdvancedInformation;
