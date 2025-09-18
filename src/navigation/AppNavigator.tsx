import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import NewShotScreen from "../screens/NewShotScreen";
import ShotDetailScreen from "../screens/ShotDetailScreen";
import BeansScreen from "../screens/BeansScreen";
import MachinesScreen from "../screens/MachinesScreen";
import SvgIcon from "../components/SvgIcon";
import { colors } from "../themes/colors";

export type RootStackParamList = {
  Shots: undefined;
  ShotDetail: { shotId: string };
  NewShot: { duplicateFrom?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Beans: undefined;
  Machines: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function ShotsTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === "Home") {
            iconName = focused ? "coffee_filled" : "coffee";
          } else if (route.name === "Beans") {
            iconName = focused ? "bean_filled" : "bean";
          } else if (route.name === "Machines") {
            iconName = focused ? "coffeemaker_filled" : "coffeemaker";
          } else {
            iconName = "note_filled";
          }

          return <SvgIcon name={iconName as any} size={size} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "gray",
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Shots" }}
      />
      <Tab.Screen
        name="Beans"
        component={BeansScreen}
        options={{ title: "Beans" }}
      />
      <Tab.Screen
        name="Machines"
        component={MachinesScreen}
        options={{ title: "Machines" }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="Shots"
          component={ShotsTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ShotDetail"
          component={ShotDetailScreen}
          options={{ title: "Shot Details" }}
        />
        <Stack.Screen
          name="NewShot"
          component={NewShotScreen}
          options={({ route }) => ({
            title: route.params?.duplicateFrom
              ? "Edit Duplicated Shot"
              : "New Shot",
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
