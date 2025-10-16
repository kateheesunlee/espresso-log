import { useState } from "react";

import { Bean } from "@types";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";

import { useStore } from "../../store/useStore";
import { formatDate } from "../../utils/formatDate";
import { colors } from "../../themes/colors";

import BeanFreshnessIndicator from "./BeanFreshnessIndicator";
import BeanDateModal from "../modals/BeanDateModal";
import SvgIcon from "../SvgIcon";

const BeanManager = ({ bean }: { bean: Bean }) => {
  const [showDateModal, setShowDateModal] = useState(false);
  const { updateBean } = useStore();
  const { dates } = bean;
  const lastDateEntry = dates[dates.length - 1];
  const { type, date } = lastDateEntry;

  const handleRefreshDate = () => {
    setShowDateModal(true);
  };

  const handleDateModalSave = (updatedBean: Bean) => {
    setShowDateModal(false);
    updateBean(updatedBean);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <View style={styles.dateContainer}>
            <Text style={styles.type}>
              {type === "roasting" ? "Roasted:" : "Opened:"}
            </Text>
            <Text style={styles.date}>{formatDate(date)}</Text>
          </View>
          <BeanFreshnessIndicator bean={bean} />
        </View>
        <View style={styles.rightContainer}>
          <TouchableOpacity
            onPress={handleRefreshDate}
            style={styles.actionButton}
          >
            <SvgIcon
              name="refresh-coffee-bag"
              size={40}
              color={colors.primary}
            />
            <Text style={styles.actionButtonText}>New bag?</Text>
          </TouchableOpacity>
        </View>
      </View>
      <BeanDateModal
        visible={showDateModal}
        bean={bean}
        onSave={handleDateModalSave}
        onCancel={() => setShowDateModal(false)}
      />
    </>
  );
};

export default BeanManager;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    gap: 16,
  },
  leftContainer: {
    flex: 1,
    flexDirection: "column",
    width: "100%",
    justifyContent: "flex-start",
    gap: 12,
  },
  rightContainer: {
    flexShrink: 0,
    gap: 8,
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    gap: 4,
  },
  type: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  date: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.textSecondary,
  },
  actionButton: {
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    boxShadow: `0 0 4px 0 rgba(0, 0, 0, 0.1)`,
  },
  actionButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.primary,
  },
});
