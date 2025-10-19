import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useStore } from '../store/useStore';
import { Machine } from '@types';
import {
  MainTabParamList,
  RootStackParamList,
} from '../navigation/AppNavigator';
import { colors } from '../themes/colors';

import SvgIcon from '../components/SvgIcon';
import MachineCard from '../components/cards/MachineCard';
import ScrollableListView from '../components/ScrollableListView';
import EmptyEntity from '../components/EmptyEntity';

type MachinesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const MachinesScreen: React.FC = () => {
  const { machines, isLoading, loadMachines } = useStore();
  const navigation = useNavigation<MachinesScreenNavigationProp>();
  const route = useRoute<RouteProp<MainTabParamList, 'Machines'>>();

  useEffect(() => {
    loadMachines();
  }, [loadMachines]);

  // Auto-open form if requested from navigation
  useEffect(() => {
    if (route.params?.openModal) {
      handleAddMachine();
    }
  }, [route.params?.openModal]);

  const handleAddMachine = () => {
    (navigation as any).navigate('NewMachine');
  };

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
