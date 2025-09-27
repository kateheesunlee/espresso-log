import React from "react";
import { Machine } from "../../database/UniversalDatabase";
import BaseCard from "./BaseCard";
import { useStore } from "../../store/useStore";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/AppNavigator";

export interface MachineCardProps {
  machine: Machine;
  onPress?: () => void;
}

type MachineCardNavigationProp = StackNavigationProp<RootStackParamList>;

const MachineCard: React.FC<MachineCardProps> = ({ machine, onPress }) => {
  const { deleteMachine } = useStore();
  const navigation = useNavigation<MachineCardNavigationProp>();

  const title = machine.nickname || machine.brand;
  const subtitle = `${machine.model}${
    machine.grinder ? ` + ${machine.grinder}` : ""
  }`;

  const handleEdit = () => {
    (navigation as any).navigate("NewMachine", { machineId: machine.id });
  };

  const handleDelete = async () => {
    await deleteMachine(machine.id);
  };

  return (
    <BaseCard
      showAvatar={true}
      data={machine as any}
      title={title}
      subtitle={subtitle}
      fallbackIcon="coffeemaker"
      onDelete={handleDelete}
      onEdit={handleEdit}
      onPress={onPress}
      showDeleteGesture={true}
      showDate={true}
    />
  );
};

export default MachineCard;
