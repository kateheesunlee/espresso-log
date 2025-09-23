import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useStore } from "../store/useStore";
import { Bean } from "../database/UniversalDatabase";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { MainTabParamList } from "../navigation/AppNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import SvgIcon from "../components/SvgIcon";
import EntityCard, {
  EntityCardData,
  EntityCardAction,
} from "../components/EntityCard";
import ScrollableListView from "../components/ScrollableListView";
import EmptyEntity from "../components/EmptyEntity";
import ConfirmationModal from "../components/ConfirmationModal";
import ErrorModal from "../components/ErrorModal";
import { colors } from "../themes/colors";

type BeansScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const BeanItem: React.FC<{
  bean: Bean;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ bean, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const details: string[] = [];
  if (bean.process) details.push(`Process: ${bean.process}`);
  if (bean.roastLevel) details.push(`Roast: ${bean.roastLevel}`);
  if (bean.roastDate) details.push(`Roasted: ${formatDate(bean.roastDate)}`);

  const actions: EntityCardAction[] = [
    { icon: "edit", onPress: onEdit },
    { icon: "delete", onPress: onDelete },
  ];

  return (
    <EntityCard
      data={bean as EntityCardData}
      title={bean.name}
      subtitle={bean.origin}
      details={details}
      fallbackIcon="bean"
      actions={actions}
    />
  );
};

const BeansScreen: React.FC = () => {
  const { beans, isLoading, loadBeans, deleteBean } = useStore();
  const navigation = useNavigation<BeansScreenNavigationProp>();
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    visible: boolean;
    bean: Bean | null;
  }>({ visible: false, bean: null });

  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });
  const route = useRoute<RouteProp<MainTabParamList, "Beans">>();

  useEffect(() => {
    loadBeans();
  }, [loadBeans]);

  // Auto-open form if requested from navigation
  useEffect(() => {
    if (route.params?.openModal) {
      handleAddBean();
    }
  }, [route.params?.openModal]);

  const handleAddBean = () => {
    (navigation as any).navigate("NewBean");
  };

  const handleEditBean = (bean: Bean) => {
    (navigation as any).navigate("NewBean", { beanId: bean.id });
  };

  const handleDeleteBean = (bean: Bean) => {
    setDeleteConfirmation({ visible: true, bean });
  };

  const confirmDeleteBean = async () => {
    if (deleteConfirmation.bean) {
      try {
        await deleteBean(deleteConfirmation.bean.id);
      } catch (error) {
        setErrorModal({ visible: true, message: "Failed to delete bean" });
      }
    }
    setDeleteConfirmation({ visible: false, bean: null });
  };

  const cancelDeleteBean = () => {
    setDeleteConfirmation({ visible: false, bean: null });
  };

  const renderBean = ({ item }: { item: Bean }) => (
    <BeanItem
      bean={item}
      onEdit={() => handleEditBean(item)}
      onDelete={() => handleDeleteBean(item)}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading beans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Coffee Beans</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddBean}>
          <SvgIcon name="plus" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollableListView
        data={beans}
        renderItem={renderBean}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        emptyComponent={
          <EmptyEntity
            icon="bean"
            title="No beans yet"
            subtitle="Add your coffee beans to track their characteristics and roast information"
            buttonText="Add Your First Bean"
            onButtonPress={handleAddBean}
          />
        }
      />

      <ConfirmationModal
        visible={deleteConfirmation.visible}
        title="Delete Bean"
        message={`Are you sure you want to delete "${deleteConfirmation.bean?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteBean}
        onCancel={cancelDeleteBean}
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

export default BeansScreen;
