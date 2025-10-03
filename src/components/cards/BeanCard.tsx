import React from "react";
import { Bean } from "../../database/UniversalDatabase";
import BaseCard from "./BaseCard";
import { useStore } from "../../store/useStore";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import RoastingIndicator from "../RoastingIndicator";
import { Text } from "react-native";

export interface BeanCardProps {
  bean: Bean;
}

type BeanCardNavigationProp = StackNavigationProp<RootStackParamList>;

const BeanCard: React.FC<BeanCardProps> = ({ bean }) => {
  const { deleteBean, toggleFavoriteBean } = useStore();
  const navigation = useNavigation<BeanCardNavigationProp>();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const details: string[] = [];
  if (bean.origin) details.push(`Origin: ${bean.origin}`);
  if (bean.process) details.push(`Process: ${bean.process}`);
  if (bean.roastDate) details.push(`Roasted: ${formatDate(bean.roastDate)}`);
  if (bean.aromaTags && bean.aromaTags.length > 0) {
    details.push(`Aroma: ${bean.aromaTags.join(", ")}`);
  }

  const handlePress = () => {
    (navigation as any).navigate("NewBean", { beanId: bean.id });
  };

  const handleDelete = async () => {
    await deleteBean(bean.id);
  };

  const handleToggleFavorite = async () => {
    await toggleFavoriteBean(bean.id);
  };

  const title = () => {
    return (
      <Text>
        {bean.name}{" "}
        <RoastingIndicator roastLevel={bean.roastLevel!} size="lg" compact />
      </Text>
    );
  };

  const subtitle = () => {
    return <RoastingIndicator roastLevel={bean.roastLevel!} size="md" />;
  };

  return (
    <BaseCard
      showAvatar={true}
      data={bean as any}
      title={bean.name}
      subtitle={subtitle()}
      details={details}
      fallbackIcon="bean"
      onDelete={handleDelete}
      onFavorite={handleToggleFavorite}
      onPress={handlePress}
      showDeleteGesture={true}
      showDate={false}
      isFavorite={bean.isFavorite}
    />
  );
};

export default BeanCard;
