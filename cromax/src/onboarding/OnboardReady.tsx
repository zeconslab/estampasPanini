import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, fonts } from '../theme';
import { HapticPress } from '../components/HapticPress';
import { MxBunting } from '../components/MxBunting';

interface Props { name: string; onDone: () => void }

export function OnboardReady({ name, onDone }: Props) {
  const t = useTheme();
  return (
    <View style={[styles.screen, { backgroundColor: t.pitch }]}>
      <View style={styles.buntingWrap}><MxBunting /></View>

      <View style={styles.content}>
        <Text style={styles.eyebrow}>¡Todo listo!</Text>
        <Text style={styles.title}>Bienvenido,{'\n'}{name} 👋</Text>
        <Text style={[styles.sub, { color: 'rgba(242,232,208,0.80)' }]}>
          Ya puedes empezar a llenar{'\n'}tu álbum del Mundial 2026.
        </Text>
      </View>

      <View style={[styles.cta, { backgroundColor: t.paper }]}>
        <HapticPress style={[styles.btn, { backgroundColor: t.primary }]} onPress={onDone}>
          <Text style={[styles.btnText, { color: t.pitch }]}>Ver mi álbum</Text>
        </HapticPress>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  buntingWrap: {
    position: 'absolute',
    top: 80,
    left: 26,
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 26,
    paddingTop: 140,
    justifyContent: 'flex-end',
    paddingBottom: 32,
  },
  eyebrow: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 10,
    color: '#E89B2F',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: '#fff',
    letterSpacing: -1.2,
    lineHeight: 42,
    marginBottom: 14,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
  },
  cta: {
    padding: 18,
    paddingBottom: 30,
  },
  btn: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: fonts.headline,
    fontSize: 16,
    letterSpacing: -0.2,
  },
});
