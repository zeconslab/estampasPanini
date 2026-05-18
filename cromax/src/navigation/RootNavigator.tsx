import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MainTabs } from './MainTabs';

export type RootStackParamList = {
  Main:         undefined;
  StickerModal: { stickerId: number };
  ShareModal:   undefined;
  ScanModal:    undefined;
  QuickAdd:     undefined;
  FriendDetail: { friendId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, presentation: 'modal' }}>
        <Stack.Screen name="Main" component={MainTabs} options={{ presentation: 'card' }} />
        {/* Modal screens added in Task 17 */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
