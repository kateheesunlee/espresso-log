import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Bean } from '@types';
import {
  MainTabParamList,
  RootStackParamList,
} from '../navigation/AppNavigator';
import { useStore } from '../store/useStore';
import { colors } from '../themes/colors';

import BeanCard from '../components/cards/BeanCard';
import EmptyEntity from '../components/EmptyEntity';
import ScrollableListView from '../components/ScrollableListView';
import SvgIcon from '../components/SvgIcon';

type BeansScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const BeansScreen: React.FC = () => {
  const { beans, isLoading, loadBeans } = useStore();
  const navigation = useNavigation<BeansScreenNavigationProp>();
  const route = useRoute<RouteProp<MainTabParamList, 'Beans'>>();

  const handleAddBean = useCallback(() => {
    navigation.navigate({
      name: 'NewBean',
      params: {},
    });
  }, [navigation]);

  useEffect(() => {
    loadBeans();
  }, [loadBeans]);

  // Auto-open form if requested from navigation
  useEffect(() => {
    if (route.params?.openModal) {
      handleAddBean();
    }
  }, [route.params?.openModal, handleAddBean]);

  const renderBean = ({ item }: { item: Bean }) => <BeanCard bean={item} />;

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
          <SvgIcon name='plus' size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollableListView
        data={beans}
        renderItem={renderBean}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        emptyComponent={
          <EmptyEntity
            icon='bean'
            title='No beans yet'
            subtitle='Add your coffee beans to track their characteristics and roast information'
            buttonText='Add Your First Bean'
            onButtonPress={handleAddBean}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  container: {
    backgroundColor: colors.bgLight,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
    color: colors.textDark,
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textMedium,
    fontSize: 16,
  },
});

export default BeansScreen;
