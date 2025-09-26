import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useStore } from "../store/useStore";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Shot } from "../database/UniversalDatabase";
import SvgIcon from "../components/SvgIcon";
import CustomPicker from "../components/CustomPicker";
import ScrollableListView from "../components/ScrollableListView";
import EmptyEntity from "../components/EmptyEntity";
import ShotCard from "../components/ShotCard";
import { colors } from "../themes/colors";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { shots, beans, machines, isLoading, loadShots } = useStore();

  // Filter state
  const [selectedBeanId, setSelectedBeanId] = useState<string>("");
  const [selectedMachineId, setSelectedMachineId] = useState<string>("");
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);

  useEffect(() => {
    loadShots();
  }, [loadShots]);

  // Pre-select filters based on last shot (only if user hasn't interacted)
  useEffect(() => {
    if (
      shots.length > 0 &&
      beans.length > 0 &&
      machines.length > 0 &&
      !hasUserInteracted
    ) {
      const lastShot = shots[0]; // Shots are sorted by creation date desc

      // Pre-select bean from last shot
      if (lastShot.beanId && !selectedBeanId) {
        setSelectedBeanId(lastShot.beanId);
      }

      // Pre-select machine from last shot
      if (lastShot.machineId && !selectedMachineId) {
        setSelectedMachineId(lastShot.machineId);
      }
    }
  }, [
    shots,
    beans,
    machines,
    selectedBeanId,
    selectedMachineId,
    hasUserInteracted,
  ]);

  // Clear filters when selected bean or machine is deleted
  useEffect(() => {
    if (selectedBeanId && !beans.find((bean) => bean.id === selectedBeanId)) {
      setSelectedBeanId("");
    }
  }, [beans, selectedBeanId]);

  useEffect(() => {
    if (
      selectedMachineId &&
      !machines.find((machine) => machine.id === selectedMachineId)
    ) {
      setSelectedMachineId("");
    }
  }, [machines, selectedMachineId]);

  // Wrapper functions to track user interaction
  const handleBeanChange = (beanId: string) => {
    setSelectedBeanId(beanId);
    setHasUserInteracted(true);
  };

  const handleMachineChange = (machineId: string) => {
    setSelectedMachineId(machineId);
    setHasUserInteracted(true);
  };

  // Filter shots based on selected filters
  const filteredShots = shots.filter((shot) => {
    const beanMatch = !selectedBeanId || shot.beanId === selectedBeanId;
    const machineMatch =
      !selectedMachineId || shot.machineId === selectedMachineId;
    return beanMatch && machineMatch;
  });

  const handleNewShot = () => {
    navigation.navigate("NewShot", {
      selectedBeanId: selectedBeanId || undefined,
      selectedMachineId: selectedMachineId || undefined,
    });
  };

  const renderShot = ({ item }: { item: Shot }) => <ShotCard shot={item} />;

  // Prepare picker options
  const beanOptions = beans.map((bean) => ({
    id: bean.id,
    name: bean.name,
  }));

  const machineOptions = machines.map((machine) => ({
    id: machine.id,
    name:
      machine.nickname ||
      `${machine.brand} ${machine.model}${
        machine.grinder ? ` + ${machine.grinder}` : ""
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
          <SvgIcon name="plus" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {(showBeanFilter || showMachineFilter) && (
        <View style={styles.filtersContainer}>
          {showBeanFilter && (
            <CustomPicker
              label="Bean"
              value={selectedBeanId}
              options={beanOptions}
              onValueChange={handleBeanChange}
              placeholder="All beans"
              compact={true}
              showClearButton={true}
            />
          )}
          {showMachineFilter && (
            <CustomPicker
              label="Machine"
              value={selectedMachineId}
              options={machineOptions}
              onValueChange={handleMachineChange}
              placeholder="All machines"
              compact={true}
              showClearButton={true}
            />
          )}
        </View>
      )}

      <ScrollableListView
        data={filteredShots}
        renderItem={renderShot}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        emptyComponent={
          <EmptyEntity
            icon="coffee"
            title={
              shots.length === 0 ? "No shots yet" : "No shots match filters"
            }
            subtitle={
              shots.length === 0
                ? "Log your first espresso shot and begin your extraction journey."
                : "Try adjusting your filter selections to see more shots."
            }
            buttonText={
              shots.length === 0 ? "Record Your First Shot" : undefined
            }
            onButtonPress={shots.length === 0 ? handleNewShot : undefined}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMedium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textDark,
  },
  newShotButton: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
});

export default HomeScreen;
