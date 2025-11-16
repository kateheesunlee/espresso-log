import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Machine } from '@types';
import {
  MainTabParamList,
  RootStackParamList,
} from '../navigation/AppNavigator';
import { useStore } from '../store/useStore';
import { colors } from '../themes/colors';

import MachineCard from '../components/cards/MachineCard';
import EmptyEntity from '../components/EmptyEntity';
import ScrollableListView from '../components/ScrollableListView';
import SvgIcon from '../components/SvgIcon';

type MachinesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const MachinesScreen: React.FC = () => {
  const { machines, isLoading, loadMachines } = useStore();
  const navigation = useNavigation<MachinesScreenNavigationProp>();
  const route = useRoute<RouteProp<MainTabParamList, 'Machines'>>();

  const handleAddMachine = useCallback(() => {
    navigation.navigate({
      name: 'NewMachine',
      params: {},
    });
  }, [navigation]);

  useEffect(() => {
    loadMachines();
  }, [loadMachines]);

  // Auto-open form if requested from navigation
  useEffect(() => {
    if (route.params?.openModal) {
      handleAddMachine();
    }
  }, [route.params?.openModal, handleAddMachine]);

  const renderMachine = ({ item }: { item: Machine }) => (
    <MachineCard machine={item} />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading machines...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Espresso Machines</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddMachine}>
          <SvgIcon name='plus' size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollableListView
        data={machines}
        renderItem={renderMachine}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        emptyComponent={
          <EmptyEntity
            icon='coffeemaker'
            title='No machines yet'
            subtitle='Add your espresso machines to track which one you used for each shot'
            buttonText='Add Your First Machine'
            onButtonPress={handleAddMachine}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  container: {
    backgroundColor: colors.bgLight,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
    color: colors.textDark,
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textMedium,
    fontSize: 16,
  },
});

export default MachinesScreen;
