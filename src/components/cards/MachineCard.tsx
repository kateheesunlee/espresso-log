import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { Machine } from '@types';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useStore } from '../../store/useStore';

import BaseCard from './BaseCard';

export interface MachineCardProps {
  machine: Machine;
}

type MachineCardNavigationProp = StackNavigationProp<RootStackParamList>;

const MachineCard: React.FC<MachineCardProps> = ({ machine }) => {
  const { deleteMachine } = useStore();
  const navigation = useNavigation<MachineCardNavigationProp>();

  const title = machine.nickname || machine.brand;
  const subtitle = `${machine.model}${
    machine.grinder ? ` + ${machine.grinder}` : ''
  }`;

  const handlePress = () => {
    (navigation as any).navigate('NewMachine', { machineId: machine.id });
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
      fallbackIcon='coffeemaker'
      onDelete={handleDelete}
      onPress={handlePress}
      showDeleteGesture={true}
    />
  );
};

export default MachineCard;
