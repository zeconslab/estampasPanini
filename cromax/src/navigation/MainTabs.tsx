import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen }    from '../screens/HomeScreen';
import { GridScreen }    from '../screens/GridScreen';
import { TradeScreen }   from '../screens/TradeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CustomTabBar }  from './CustomTabBar';

const Tab = createBottomTabNavigator();

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"    component={HomeScreen} />
      <Tab.Screen name="Grid"    component={GridScreen} />
      <Tab.Screen name="Trade"   component={TradeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
