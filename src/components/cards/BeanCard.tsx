import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { Bean } from '@types';
import { StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useStore } from '../../store/useStore';

import { colors } from '../../themes/colors';
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

  const showBeanManager = bean.dates?.length > 0;

  const getAltitudeText = () => {
    if (bean.altitudeMin && bean.altitudeMax) {
      if (bean.altitudeMin === bean.altitudeMax) {
        return `${bean.altitudeMin} meters`;
      }
      return `${bean.altitudeMin} - ${bean.altitudeMax} meters`;
    }
    return bean.altitudeMin || bean.altitudeMax
      ? `${bean.altitudeMin || bean.altitudeMax} meters`
      : undefined;
  };

  const advancedFieldsRow1 = [
    bean.origin,
    bean.producer,
    getAltitudeText(),
  ].filter(Boolean);

  const advancedFieldsRow2 = [
    bean.varietal,
    bean.process,
    bean.processDetail,
  ].filter(Boolean);

  const handlePress = () => {
    (navigation as any).navigate('NewBean', { beanId: bean.id });
  };

  const handleDelete = async () => {
    await deleteBean(bean.id);
  };

  const handleToggleFavorite = async () => {
    await toggleFavoriteBean(bean.id);
  };

  const title = bean.roaster ? `${bean.roaster} ${bean.name}` : bean.name;

  // add roasting indicator to subtitle section
  const subtitle = () => {
    return (
      <RoastingIndicator roastLevel={bean.roastLevel || 'Medium'} size='md' />
    );
  };

  const additionalContent = () => {
    return (
      <View style={styles.additionalContent}>
        {/* aroma tags */}
        {bean.aromaTags && bean.aromaTags.length > 0 && (
          <Text style={styles.aromaTagsText}>
            {bean.aromaTags
              .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1))
              .join(', ')}
          </Text>
        )}
        {/* advanced fields */}
        {advancedFieldsRow1.length > 0 && (
          <View style={styles.advancedFieldsContainer}>
            {advancedFieldsRow1.map((detail, index) => (
              <Text key={index} style={styles.advancedFieldText}>
                {detail}
                {index < advancedFieldsRow1.length - 1 ? ' • ' : ''}
              </Text>
            ))}
          </View>
        )}
        {advancedFieldsRow2.length > 0 && (
          <View style={styles.advancedFieldsContainer}>
            {advancedFieldsRow2.map((detail, index) => (
              <Text key={index} style={styles.advancedFieldText}>
                {detail}
                {index < advancedFieldsRow2.length - 1 ? ' • ' : ''}
              </Text>
            ))}
          </View>
        )}
        {/* bean manager */}
        {showBeanManager ? <BeanManager bean={bean} /> : null}
      </View>
    );
  };

  return (
    <BaseCard
      showAvatar={true}
      data={bean as any}
      title={title}
      subtitle={subtitle()}
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
      additionalContent={additionalContent()}
    />
  );
};

export default BeanCard;

const styles = StyleSheet.create({
  additionalContent: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 8,
    paddingTop: 12,
  },
  advancedFieldText: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: '400',
  },
  advancedFieldsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  aromaTagsText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
});
