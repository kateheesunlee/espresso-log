/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  NavigationContainer,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import SvgIcon from '../components/SvgIcon';
import { ThemeToggle } from '../components/ThemeToggle';
import BeansScreen from '../screens/BeansScreen';
import HomeScreen from '../screens/HomeScreen';
import MachinesScreen from '../screens/MachinesScreen';
import NewBeanScreen from '../screens/NewBeanScreen';
import NewMachineScreen from '../screens/NewMachineScreen';
import NewShotScreen from '../screens/NewShotScreen';
import ShotDetailScreen from '../screens/ShotDetailScreen';
import ShotSharePreviewScreen from '../screens/ShotSharePreviewScreen';
import { useColors } from '../themes/colors';

export type RootStackParamList = {
  Shots: NavigatorScreenParams<MainTabParamList> | undefined;
  ShotDetail: { shotId: string };
  ShotSharePreview: { shotId: string; beanId: string; machineId?: string };
  NewShot: {
    duplicateFrom?: string;
    selectedBeanId?: string;
    selectedMachineId?: string;
  };
  NewBean: { beanId?: string; returnTo?: string };
  NewMachine: {
    machineId?: string;
    returnTo?: string;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Beans: { openModal?: boolean };
  Machines: { openModal?: boolean };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const getTabBarIcon = (routeName: string, focused: boolean) => {
  let iconName: string;

  if (routeName === 'Home') {
    iconName = focused ? 'coffee_filled' : 'coffee';
  } else if (routeName === 'Beans') {
    iconName = focused ? 'bean_filled' : 'bean';
  } else if (routeName === 'Machines') {
    iconName = focused ? 'coffeemaker_filled' : 'coffeemaker';
  } else {
    iconName = 'note_filled';
  }

  return iconName;
};

function ShotsTabs() {
  const colors = useColors();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => (
          <SvgIcon
            name={getTabBarIcon(route.name, focused) as any}
            size={size}
          />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.primary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => <ThemeToggle />,
      })}
    >
      <Tab.Screen
        name='Home'
        component={HomeScreen}
        options={{ title: 'Shots' }}
      />
      <Tab.Screen
        name='Beans'
        component={BeansScreen}
        options={{ title: 'Beans' }}
      />
      <Tab.Screen
        name='Machines'
        component={MachinesScreen}
        options={{ title: 'Machines' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const colors = useColors();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 17,
          },
          headerBackTitleStyle: {
            fontSize: 17,
          },
        }}
      >
        <Stack.Screen
          name='Shots'
          component={ShotsTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='ShotDetail'
          component={ShotDetailScreen}
          options={{ title: 'Shot Details' }}
        />
        <Stack.Screen
          name='ShotSharePreview'
          component={ShotSharePreviewScreen}
          options={{ title: 'Preview' }}
        />
        <Stack.Screen
          name='NewShot'
          component={NewShotScreen}
          options={({ route }) => ({
            title: route.params?.duplicateFrom ? 'Duplicate Shot' : 'New Shot',
            headerBackTitle: route.params?.duplicateFrom ? 'Details' : 'Shots',
          })}
        />
        <Stack.Screen
          name='NewBean'
          component={NewBeanScreen}
          options={({ route }) => ({
            title: route.params?.beanId ? 'Edit Bean' : 'New Bean',
            headerBackTitle: 'Beans',
          })}
        />
        <Stack.Screen
          name='NewMachine'
          component={NewMachineScreen}
          options={({ route }) => ({
            title: route.params?.machineId ? 'Edit Machine' : 'New Machine',
            headerBackTitle: 'Machines',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
