import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Bean, createBeanDateEntry, normalizeDateForStorage } from "@types";

import BaseModal, { ButtonConfig } from "./BaseModal";
import BeanFreshnessForm from "../BeanManager/BeanFreshnessForm";
import { DEFAULT_EXPIRATION_PERIOD_WEEKS } from "../BeanManager/constants";

export interface BeanDateModalProps {
  visible: boolean;
  bean: Bean;
  onSave: (bean: Bean) => void;
  onCancel: () => void;
}

const BeanDateModal: React.FC<BeanDateModalProps> = ({
  visible,
  bean,
  onSave,
  onCancel,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateType, setDateType] = useState<"roasting" | "opening">("roasting");
  const [expirationPeriodWeeks, setExpirationPeriodWeeks] = useState(
    bean.expirationPeriodWeeks || 2
  );

  const handleSave = () => {
    const newDateEntry = createBeanDateEntry(
      normalizeDateForStorage(selectedDate),
      dateType
    );

    const updatedBean: Bean = {
      ...bean,
      dates: [...(bean.dates || []), newDateEntry],
      expirationPeriodWeeks,
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedBean);
    // Reset form
    setSelectedDate(new Date());
    setDateType("roasting");
    setExpirationPeriodWeeks(
      bean.expirationPeriodWeeks || DEFAULT_EXPIRATION_PERIOD_WEEKS
    );
  };

  const buttonConfigs: ButtonConfig[] = [
    {
      text: "Cancel",
      onPress: onCancel,
    },
    {
      text: "Add Date",
      onPress: handleSave,
    },
  ];

  return (
    <BaseModal
      title="New bean bag"
      message="Did you buy a new bag? Add your bean's roasting or opening date to track its freshness."
      visible={visible}
      buttonConfigs={buttonConfigs}
    >
      <BeanFreshnessForm
        initialDate={new Date()}
        initialDateType="roasting"
        onDateChange={setSelectedDate}
        onDateTypeChange={setDateType}
        expirationPeriodWeeks={expirationPeriodWeeks}
        onExpirationPeriodChange={setExpirationPeriodWeeks}
      />
    </BaseModal>
  );
};

export default BeanDateModal;
