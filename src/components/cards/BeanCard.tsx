import React from "react";
import { Bean } from "../../database/UniversalDatabase";
import BaseCard from "./BaseCard";
import { useStore } from "../../store/useStore";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/AppNavigator";

export interface BeanCardProps {
  bean: Bean;
  onPress?: () => void;
}

type BeanCardNavigationProp = StackNavigationProp<RootStackParamList>;

const BeanCard: React.FC<BeanCardProps> = ({ bean, onPress }) => {
  const { deleteBean } = useStore();
  const navigation = useNavigation<BeanCardNavigationProp>();

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

  const handleEdit = () => {
    (navigation as any).navigate("NewBean", { beanId: bean.id });
  };

  const handleDelete = async () => {
    await deleteBean(bean.id);
  };

  return (
    <BaseCard
      showAvatar={true}
      data={bean as any}
      title={bean.name}
      subtitle={bean.origin}
      details={details}
      fallbackIcon="bean"
      onDelete={handleDelete}
      onEdit={handleEdit}
      onPress={onPress}
      showDeleteGesture={true}
      showDate={true}
    />
  );
};

export default BeanCard;
