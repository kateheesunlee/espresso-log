import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../themes/colors';
import FormField from '../inputs/FormField';

interface CreateRoasterModalProps {
  visible: boolean;
  pendingName?: string;
  onRequestClose: () => void;
  onSave: (data: {
    name: string;
    aliases: string[];
    country: string;
    state: string;
  }) => Promise<void>;
}

const CreateRoasterModal: React.FC<CreateRoasterModalProps> = ({
  visible,
  pendingName = '',
  onRequestClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [aliasesStr, setAliasesStr] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Update name when modal opens with pending name
  React.useEffect(() => {
    if (visible && pendingName) {
      setName(pendingName);
    } else if (!visible) {
      // Reset form when closing
      setName('');
      setAliasesStr('');
      setCountry('');
      setState('');
    }
  }, [visible, pendingName]);

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const aliases = aliasesStr
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      await onSave({
        name: name.trim(),
        aliases,
        country: country.trim(),
        state: state.trim(),
      });

      // Reset form
      setName('');
      setAliasesStr('');
      setCountry('');
      setState('');
      onRequestClose();
    } catch (error) {
      console.error('Error saving roaster:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onRequestClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add New Roaster</Text>
            <TouchableOpacity
              onPress={onRequestClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
          >
            <FormField label='Roaster Name' required>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder='e.g., Blue Bottle Coffee'
                autoCapitalize='words'
              />
            </FormField>

            <FormField label='Aliases (Optional)'>
              <TextInput
                style={styles.input}
                value={aliasesStr}
                onChangeText={setAliasesStr}
                placeholder='e.g., Blue Bottle, BB'
                autoCapitalize='words'
              />
              <Text style={styles.hint}>
                Separate multiple aliases with commas
              </Text>
            </FormField>

            <FormField label='Country (Optional)'>
              <TextInput
                style={styles.input}
                value={country}
                onChangeText={setCountry}
                placeholder='e.g., United States'
                autoCapitalize='words'
              />
            </FormField>

            <FormField label='State/Province (Optional)'>
              <TextInput
                style={styles.input}
                value={state}
                onChangeText={setState}
                placeholder='e.g., California'
                autoCapitalize='words'
              />
            </FormField>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onRequestClose}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                !name.trim() && styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={!name.trim() || isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    flex: 1,
    padding: 14,
  },
  buttonContainer: {
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  cancelButton: {
    backgroundColor: colors.bgLight,
  },
  cancelButtonText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: colors.textMedium,
    fontSize: 24,
  },
  content: {
    maxHeight: 400,
    padding: 16,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  hint: {
    color: colors.textMedium,
    fontSize: 12,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    padding: 12,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CreateRoasterModal;
