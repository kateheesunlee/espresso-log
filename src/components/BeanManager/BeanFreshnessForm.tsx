import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../../themes/colors";
import { formatDate } from "src/utils/formatDate";

import { FormField } from "../inputs";
import SvgIcon from "../SvgIcon";
import ExpirationPeriodSelector from "./ExpirationPeriodSelector";

type DateType = "roasting" | "opening";

export interface BeanFreshnessFormProps {
  initialDate?: Date;
  initialDateType?: DateType;
  onDateChange: (date: Date) => void;
  onDateTypeChange: (type: DateType) => void;
  expirationPeriodWeeks?: number;
  onExpirationPeriodChange?: (weeks: number) => void;
}

const BeanFreshnessForm: React.FC<BeanFreshnessFormProps> = ({
  initialDate,
  initialDateType = "roasting",
  onDateChange,
  onDateTypeChange,
  expirationPeriodWeeks = 2,
  onExpirationPeriodChange,
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [dateType, setDateType] = useState<"roasting" | "opening">(
    initialDateType
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Update selected date when initialDate changes (but not while picker is open)
  useEffect(() => {
    if (initialDate && !showDatePicker) {
      setSelectedDate(initialDate);
    }
  }, [initialDate, showDatePicker]);

  // Update date type when initialDateType changes
  useEffect(() => {
    setDateType(initialDateType);
  }, [initialDateType]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
      onDateChange(date);
    }
  };

  const handleDateTypeChange = (type: "roasting" | "opening") => {
    setDateType(type);
    onDateTypeChange(type);
  };

  const getDateTypeLabel = (type: "roasting" | "opening") => {
    return type === "roasting" ? "Roasting Date" : "Opening Date";
  };

  const getDateTypeDescription = (type: "roasting" | "opening") => {
    return type === "roasting"
      ? "When the beans were roasted"
      : "When you opened the bag";
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Date Type Selection */}
      <FormField label="Track freshness from">
        <View style={styles.typeButtons}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              dateType === "roasting" && styles.typeButtonActive,
            ]}
            onPress={() => handleDateTypeChange("roasting")}
          >
            <SvgIcon
              name="roaster"
              size={40}
              color={dateType === "roasting" ? colors.primary : colors.textDark}
            />
            <Text
              style={[
                styles.typeButtonText,
                dateType === "roasting" && styles.typeButtonTextActive,
              ]}
            >
              Roasting
            </Text>
            <Text
              style={[
                styles.typeButtonSubtext,
                dateType === "roasting" && styles.typeButtonSubtextActive,
              ]}
            >
              {getDateTypeDescription("roasting")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              dateType === "opening" && styles.typeButtonActive,
            ]}
            onPress={() => handleDateTypeChange("opening")}
          >
            <SvgIcon
              name="open_bag"
              size={40}
              color={dateType === "opening" ? colors.primary : colors.textDark}
            />
            <Text
              style={[
                styles.typeButtonText,
                dateType === "opening" && styles.typeButtonTextActive,
                {
                  marginTop: 4,
                },
              ]}
            >
              Opening
            </Text>
            <Text
              style={[
                styles.typeButtonSubtext,
                dateType === "opening" && styles.typeButtonSubtextActive,
              ]}
            >
              {getDateTypeDescription("opening")}
            </Text>
          </TouchableOpacity>
        </View>
      </FormField>

      {/* Expiration Period */}
      {onExpirationPeriodChange && (
        <ExpirationPeriodSelector
          value={expirationPeriodWeeks}
          onValueChange={onExpirationPeriodChange}
          dateType={dateType}
        />
      )}

      {/* Date Selection */}
      <FormField label={getDateTypeLabel(dateType)}>
        <TouchableOpacity
          style={[styles.dateButton, showDatePicker && styles.dateButtonActive]}
          onPress={() => setShowDatePicker(!showDatePicker)}
        >
          <Text
            style={[
              styles.dateButtonText,
              showDatePicker && styles.dateButtonTextActive,
            ]}
          >
            {formatDate(selectedDate.toISOString())}
          </Text>
          <Text
            style={[
              styles.dateButtonSubtext,
              showDatePicker && styles.dateButtonSubtextActive,
            ]}
          >
            {showDatePicker ? "Tap to close" : "Tap to change"}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </FormField>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  typeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    backgroundColor: colors.hover,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 4,
  },
  typeButtonTextActive: {
    color: colors.primary,
  },
  typeButtonSubtext: {
    fontSize: 12,
    color: colors.textMedium,
    textAlign: "center",
  },
  typeButtonSubtextActive: {
    color: colors.primary,
  },
  dateButton: {
    backgroundColor: colors.hover,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
  },
  dateButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 4,
  },
  dateButtonTextActive: {
    color: colors.primary,
  },
  dateButtonSubtext: {
    fontSize: 12,
    color: colors.textMedium,
  },
  dateButtonSubtextActive: {
    color: colors.primary,
  },
});

export default BeanFreshnessForm;
