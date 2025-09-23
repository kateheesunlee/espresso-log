import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useStore } from "../store/useStore";
import { Machine } from "../database/UniversalDatabase";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { MainTabParamList } from "../navigation/AppNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import SvgIcon from "../components/SvgIcon";
import Avatar from "../components/Avatar";
import EntityCard, {
  EntityCardData,
  EntityCardAction,
} from "../components/EntityCard";
import ScrollableListView from "../components/ScrollableListView";
import EmptyEntity from "../components/EmptyEntity";
import ConfirmationModal from "../components/ConfirmationModal";
import ErrorModal from "../components/ErrorModal";
import { colors } from "../themes/colors";

type MachinesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const MachineItem: React.FC<{
  machine: Machine;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ machine, onEdit, onDelete }) => {
  const title = machine.nickname || `${machine.brand}`;
  const subtitle = machine.model;

  const actions: EntityCardAction[] = [
    { icon: "edit", onPress: onEdit },
    { icon: "delete", onPress: onDelete },
  ];

  return (
    <EntityCard
      data={machine as EntityCardData}
      title={title}
      subtitle={subtitle}
      fallbackIcon="coffeemaker"
      actions={actions}
    />
  );
};

const MachinesScreen: React.FC = () => {
  const { machines, isLoading, loadMachines, deleteMachine } = useStore();
  const navigation = useNavigation<MachinesScreenNavigationProp>();
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    visible: boolean;
    machine: Machine | null;
  }>({ visible: false, machine: null });

  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });
  const route = useRoute<RouteProp<MainTabParamList, "Machines">>();

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
    (navigation as any).navigate("NewMachine");
  };

  const handleEditMachine = (machine: Machine) => {
    (navigation as any).navigate("NewMachine", { machineId: machine.id });
  };

  const handleDeleteMachine = (machine: Machine) => {
    setDeleteConfirmation({ visible: true, machine });
  };

  const confirmDeleteMachine = async () => {
    if (deleteConfirmation.machine) {
      try {
        await deleteMachine(deleteConfirmation.machine.id);
      } catch (error) {
        setErrorModal({ visible: true, message: "Failed to delete machine" });
      }
    }
    setDeleteConfirmation({ visible: false, machine: null });
  };

  const cancelDeleteMachine = () => {
    setDeleteConfirmation({ visible: false, machine: null });
  };

  const renderMachine = ({ item }: { item: Machine }) => (
    <MachineItem
      machine={item}
      onEdit={() => handleEditMachine(item)}
      onDelete={() => handleDeleteMachine(item)}
    />
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
          <SvgIcon name="plus" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollableListView
        data={machines}
        renderItem={renderMachine}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        emptyComponent={
          <EmptyEntity
            icon="coffeemaker"
            title="No machines yet"
            subtitle="Add your espresso machines to track which one you used for each shot"
            buttonText="Add Your First Machine"
            onButtonPress={handleAddMachine}
          />
        }
      />

      <ConfirmationModal
        visible={deleteConfirmation.visible}
        title="Delete Machine"
        message={`Are you sure you want to delete "${
          deleteConfirmation.machine?.nickname ||
          `${deleteConfirmation.machine?.brand} ${deleteConfirmation.machine?.model}`
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteMachine}
        onCancel={cancelDeleteMachine}
        destructive={true}
      />

      <ErrorModal
        visible={errorModal.visible}
        message={errorModal.message}
        onButtonPress={() => setErrorModal({ visible: false, message: "" })}
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
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MachinesScreen;
