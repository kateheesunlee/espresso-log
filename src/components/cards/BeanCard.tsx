import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { Bean } from '@types';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useStore } from '../../store/useStore';

import BeanManager from '../BeanManager';
import RoastingIndicator from '../RoastingIndicator';
import BaseCard from './BaseCard';

export interface BeanCardProps {
  bean: Bean;
}

type BeanCardNavigationProp = StackNavigationProp<RootStackParamList>;

const BeanCard: React.FC<BeanCardProps> = ({ bean }) => {
  const { deleteBean, toggleFavoriteBean } = useStore();
  const navigation = useNavigation<BeanCardNavigationProp>();

  const details: string[] = [];
  if (bean.origin) details.push(`Origin: ${bean.origin}`);
  if (bean.process) details.push(`Process: ${bean.process}`);

  const showBeanManager = bean.dates?.length > 0;

  if (bean.aromaTags && bean.aromaTags.length > 0) {
    details.push(`Aroma: ${bean.aromaTags.join(', ')}`);
  }

  const handlePress = () => {
    (navigation as any).navigate('NewBean', { beanId: bean.id });
  };

  const handleDelete = async () => {
    await deleteBean(bean.id);
  };

  const handleToggleFavorite = async () => {
    await toggleFavoriteBean(bean.id);
  };

  const subtitle = () => {
    return (
      <RoastingIndicator roastLevel={bean.roastLevel || 'Medium'} size='md' />
    );
  };

  const title = bean.roaster ? `${bean.roaster} ${bean.name}` : bean.name;

  return (
    <BaseCard
      showAvatar={true}
      data={bean as any}
      title={title}
      subtitle={subtitle()}
      details={details}
      fallbackIcon='bean'
      onDelete={handleDelete}
      actionConfigs={[
        {
          icon: bean.isFavorite ? 'heart_filled' : 'heart',
          onPress: handleToggleFavorite,
        },
      ]}
      onPress={handlePress}
      showDeleteGesture={true}
      showDate={false}
      additionalContent={showBeanManager ? <BeanManager bean={bean} /> : null}
    />
  );
};

export default BeanCard;
