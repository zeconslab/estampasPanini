import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, fonts } from '../theme';

interface Props {
  step: number;
  total: number;
  onBack?: () => void;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}

export function OnboardingShell({ step, total, onBack, eyebrow, title, children }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: t.paper }]}
    >
      {/* Top nav: back + dots */}
      <View style={[styles.nav, { paddingTop: insets.top + 8 }]}>
        <View style={styles.navSide}>
          {step > 0 && onBack ? (
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: t.card, borderColor: t.line }]} onPress={onBack}>
              <Text style={[styles.backArrow, { color: t.ink }]}>‹</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.iconBtnPlaceholder} />
          )}
        </View>

        {/* Pill dots */}
        <View style={styles.dotsContainer}>
          <View style={dotStyles.row}>
            {Array.from({ length: total }).map((_, i) => {
              const isActive = i === step;
              const isDone   = i < step;
              return (
                <View
                  key={i}
                  style={[
                    dotStyles.dot,
                    { backgroundColor: isDone || isActive ? t.pitch : t.line2 },
                    isActive && dotStyles.dotActive,
                    isDone   && { opacity: 0.55 },
                  ]}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.navSide} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        {eyebrow ? (
          <Text style={[styles.eyebrow, { color: t.primary }]}>{eyebrow}</Text>
        ) : null}
        <Text style={[styles.title, { color: t.ink }]}>{title}</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  navSide: { width: 36 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPlaceholder: { width: 36, height: 36 },
  backArrow: {
    fontSize: 26,
    lineHeight: 32,
    marginTop: -2,
  },
  dotsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 22,
    paddingBottom: 0,
    paddingTop: 8,
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontWeight: '700',
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    letterSpacing: -0.8,
    lineHeight: 30,
  },
  content: {
    padding: 22,
    paddingTop: 18,
    paddingBottom: 32,
  },
});

const dotStyles = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot:       { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 22 },
});
