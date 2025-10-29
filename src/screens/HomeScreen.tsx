import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Shot } from '@types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useStore } from '../store/useStore';
import { colors } from '../themes/colors';

import EmptyEntity from '../components/EmptyEntity';
import EmptyEntityWithPrerequisites from '../components/EmptyEntityWithPrerequisites';
import ScrollableListView from '../components/ScrollableListView';
import SvgIcon from '../components/SvgIcon';
import ShotCard from '../components/cards/ShotCard';
import PickerField from '../components/inputs/forms/PickerField';
import { formatBeanName } from '../utils/formatBeanName';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { shots, beans, machines, isLoading, loadShots } = useStore();

  // Compute default filters from last shot
  const defaultFilters = useMemo(() => {
    if (shots.length > 0 && beans.length > 0 && machines.length > 0) {
      const lastShot = shots[0];
      return {
        beanId: lastShot.beanId || '',
        machineId: lastShot.machineId || '',
      };
    }
    return { beanId: '', machineId: '' };
  }, [shots, beans, machines]);

  // Filter state - initialized from defaults
  const [selectedBeanId, setSelectedBeanId] = useState<string>(
    defaultFilters.beanId
  );
  const [selectedMachineId, setSelectedMachineId] = useState<string>(
    defaultFilters.machineId
  );

  useEffect(() => {
    loadShots();
  }, [loadShots]);

  const handleBeanChange = (beanId: string) => {
    setSelectedBeanId(beanId);
  };

  const handleMachineChange = (machineId: string) => {
    setSelectedMachineId(machineId);
  };

  // Filter shots based on selected filters
  const filteredShots = shots.filter(shot => {
    const beanMatch = !selectedBeanId || shot.beanId === selectedBeanId;
    const machineMatch =
      !selectedMachineId || shot.machineId === selectedMachineId;
    return beanMatch && machineMatch;
  });

  const handleNewShot = () => {
    navigation.navigate('NewShot', {
      selectedBeanId: selectedBeanId || undefined,
      selectedMachineId: selectedMachineId || undefined,
    });
  };

  const renderShot = ({ item }: { item: Shot }) => <ShotCard shot={item} />;

  // Prepare picker options
  const beanOptions = beans.map(bean => ({
    id: bean.id,
    name: formatBeanName(bean),
  }));

  const machineOptions = machines.map(machine => ({
    id: machine.id,
    name:
      machine.nickname ||
      `${machine.brand} ${machine.model}${
        machine.grinder ? ` + ${machine.grinder}` : ''
      }`,
  }));

  // Check if we should show filters
  const showBeanFilter = beans.length > 1;
  const showMachineFilter = machines.length > 1;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading shots...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Shots</Text>
        <TouchableOpacity style={styles.newShotButton} onPress={handleNewShot}>
          <SvgIcon name='plus' size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {(showBeanFilter || showMachineFilter) && (
        <View style={styles.filtersContainer}>
          {showBeanFilter && (
            <PickerField
              label='Bean'
              value={selectedBeanId}
              options={beanOptions}
              onValueChange={handleBeanChange}
              placeholder='All beans'
              compact={true}
              showClearButton={true}
            />
          )}
          {showMachineFilter && (
            <PickerField
              label='Machine'
              value={selectedMachineId}
              options={machineOptions}
              onValueChange={handleMachineChange}
              placeholder='All machines'
              compact={true}
              showClearButton={true}
            />
          )}
        </View>
      )}

      <ScrollableListView
        data={filteredShots}
        renderItem={renderShot}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        emptyComponent={
          shots.length === 0 ? (
            <EmptyEntityWithPrerequisites
              icon='coffee'
              title='No shots yet'
              subtitle='Log your first espresso shot and begin your extraction journey.'
              primaryButtonText='Record Your First Shot'
              onPrimaryPress={handleNewShot}
              hasBeans={beans.length > 0}
              hasMachines={machines.length > 0}
              onAddBean={() => navigation.navigate('NewBean' as never)}
              onAddMachine={() => navigation.navigate('NewMachine' as never)}
            />
          ) : (
            <EmptyEntity
              icon='coffee'
              title='No shots match filters'
              subtitle='Try adjusting your filter selections to see more shots.'
            />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgLight,
    flex: 1,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
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
  newShotButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
});

export default HomeScreen;
