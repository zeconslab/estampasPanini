import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MainTabs }          from './MainTabs';
import { StickerSheet }      from '../sheets/StickerSheet';
import { QuickAddSheet }     from '../sheets/QuickAddSheet';
import { FriendDetailSheet } from '../sheets/FriendDetailSheet';
import { ShareSheet }        from '../sheets/ShareSheet';
import { ScanSheet }         from '../sheets/ScanSheet';

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
        <Stack.Screen name="Main"         component={MainTabs}          options={{ presentation: 'card' }} />
        <Stack.Screen name="StickerModal" component={StickerSheet} />
        <Stack.Screen name="ShareModal"   component={ShareSheet} />
        <Stack.Screen name="ScanModal"    component={ScanSheet} />
        <Stack.Screen name="QuickAdd"     component={QuickAddSheet} />
        <Stack.Screen name="FriendDetail" component={FriendDetailSheet} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
