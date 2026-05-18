import React, { useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, useTheme } from '../theme';

const ICONS: Record<string, string> = {
  Home:    '⬟',
  Grid:    '▦',
  Trade:   '⇄',
  Profile: '◉',
};

const TAB_LABELS: Record<string, string> = {
  Home:    'Álbum',
  Grid:    'Estampas',
  Trade:   'Trueque',
  Profile: 'Yo',
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const t = useTheme();
  const pillX   = useRef(new Animated.Value(0)).current;
  const pillW   = useRef(new Animated.Value(0)).current;
  const tabRefs  = useRef<{ x: number; width: number }[]>([]);
  const measured = useRef<boolean[]>(state.routes.map(() => false));

  const movePill = (idx: number) => {
    const tab = tabRefs.current[idx];
    if (!tab) return;
    Animated.spring(pillX, { toValue: tab.x + 4, useNativeDriver: false, tension: 120, friction: 8 }).start();
    Animated.spring(pillW, { toValue: tab.width - 8, useNativeDriver: false, tension: 120, friction: 8 }).start();
  };

  const handleLayout = (e: LayoutChangeEvent, idx: number) => {
    const { x, width } = e.nativeEvent.layout;
    tabRefs.current[idx] = { x, width };
    measured.current[idx] = true;
    if (measured.current.every(Boolean) || idx === state.index) {
      movePill(state.index);
    }
  };

  React.useEffect(() => {
    movePill(state.index);
  }, [state.index]);

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 4, backgroundColor: t.pitch }]}>
      <Animated.View style={[styles.pill, { left: pillX, width: pillW, backgroundColor: t.primary }]} />
      {state.routes.map((route, idx) => {
        const focused = idx === state.index;
        const { options } = descriptors[route.key];
        const label = options.title ?? TAB_LABELS[route.name] ?? route.name;
        const icon  = ICONS[route.name] ?? '●';

        return (
          <Pressable
            key={route.key}
            onLayout={e => handleLayout(e, idx)}
            onPress={() => {
              if (!focused) navigation.navigate(route.name);
            }}
            style={styles.tab}
          >
            <Text style={[styles.icon, { color: focused ? t.paper : t.ink4 }]}>{icon}</Text>
            <Text style={[styles.label, { color: focused ? t.paper : t.ink4 }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: 6,
    height: 44,
    borderRadius: 22,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    zIndex: 1,
  },
  icon:  { fontSize: 18, marginBottom: 2 },
  label: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 0.1 },
});
