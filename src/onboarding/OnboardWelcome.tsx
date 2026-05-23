import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, fonts } from '../theme';
import { HapticPress } from '../components/HapticPress';
import { MxBunting } from '../components/MxBunting';

const { width: W } = Dimensions.get('window');
const CARD_W = 140;
const CARD_H = Math.round(CARD_W * 7 / 5);
const SMALL_W = 78;
const SMALL_H = Math.round(SMALL_W * 7 / 5);

interface Props { onNext: () => void }

// ── Floating mini sticker card ───────────────────────────────────────────────

function FloatingCard({
  colors, label, size, delay = 0, duration = 3800, rotate = '0deg', top, left, right,
}: {
  colors: [string, string, string];
  label: string;
  size: number;
  delay?: number;
  duration?: number;
  rotate?: string;
  top: number;
  left?: number;
  right?: number;
}) {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(float, { toValue: 1, duration: duration / 2, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(float, { toValue: 0, duration: duration / 2, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const h       = Math.round(size * 7 / 5);
  const footH   = Math.max(10, Math.round(h * 0.14));
  const tyAnim  = float.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });

  const posStyle: Record<string, number | string> = { position: 'absolute', top };
  if (left  !== undefined) posStyle.left  = left;
  if (right !== undefined) posStyle.right = right;

  return (
    <Animated.View style={[posStyle, { transform: [{ rotate }, { translateY: tyAnim }] }]}>
      <View style={{
        width: size, height: h, backgroundColor: '#fff',
        borderRadius: 6, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
      }}>
        <LinearGradient colors={colors} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ flex: 1 }} />
        <View style={{ height: footH, backgroundColor: '#0E5B3A', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{
            fontFamily: fonts.mono,
            fontSize: Math.max(5, Math.round(size * 0.095)),
            color: '#fff', textTransform: 'uppercase', letterSpacing: 0.4,
          }}>
            {label}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ── Welcome screen ───────────────────────────────────────────────────────────

export function OnboardWelcome({ onNext }: Props) {
  const t      = useTheme();
  const insets = useSafeAreaInsets();

  const floatMex = useRef(new Animated.Value(0)).current;
  const floatArg = useRef(new Animated.Value(0)).current;
  const floatBra = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startFloat = (anim: Animated.Value, delay: number, dur: number) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: dur / 2, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
            Animated.timing(anim, { toValue: 0, duration: dur / 2, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
          ])
        ).start();
      }, delay);
    };
    startFloat(floatMex, 0,    4000);
    startFloat(floatArg, 600,  3600);
    startFloat(floatBra, 1100, 4400);
  }, []);

  const tyMex = floatMex.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  const tyArg = floatArg.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  const tyBra = floatBra.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });

  return (
    <View style={styles.screen}>
      {/* Green hero panel */}
      <View style={styles.hero}>
        <View style={styles.buntingWrap}><MxBunting /></View>

        {/* MEX 01 — main card */}
        <Animated.View style={[
          styles.stickerMain,
          { left: W / 2 - CARD_W / 2, transform: [{ rotate: '-6deg' }, { translateY: tyMex }] },
        ]}>
          <View style={styles.stickerCard}>
            <Text style={styles.stickerNum}>MEX 01</Text>
            <LinearGradient
              colors={['#006847', '#FFFFFF', '#CE1126']}
              start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
              style={styles.stickerArt}
            >
              <Text style={styles.stickerInit}>OCH</Text>
            </LinearGradient>
            <View style={styles.stickerFoot}>
              <Text style={styles.stickerFootText}>MEX</Text>
            </View>
          </View>
        </Animated.View>

        {/* ARG — left */}
        <Animated.View style={[styles.stickerLeft, { transform: [{ rotate: '-14deg' }, { translateY: tyArg }] }]}>
          <View style={styles.stickerSmall}>
            <LinearGradient
              colors={['#75AADB', '#FFFFFF', '#75AADB']}
              start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
              style={styles.stickerSmallArt}
            />
            <View style={styles.stickerSmallFoot}><Text style={styles.stickerSmallFootText}>ARG</Text></View>
          </View>
        </Animated.View>

        {/* BRA — right */}
        <Animated.View style={[styles.stickerRight, { transform: [{ rotate: '12deg' }, { translateY: tyBra }] }]}>
          <View style={styles.stickerSmall}>
            <LinearGradient
              colors={['#FEDF00', '#009C3B', '#002776']}
              start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
              style={styles.stickerSmallArt}
            />
            <View style={styles.stickerSmallFoot}><Text style={styles.stickerSmallFootText}>BRA</Text></View>
          </View>
        </Animated.View>

        {/* ── 4 cards en diamante circular ── */}
        {/* Círculo radio=80: GER↑ FRA← ESP→ USA↓ */}
        <FloatingCard
          colors={['#000000', '#DD0000', '#FFCE00']} label="GER" size={58}
          top={409} left={W / 2 - 29} rotate="-3deg" delay={900} duration={4000}
        />
        <FloatingCard
          colors={['#002395', '#FFFFFF', '#ED2939']} label="FRA" size={64}
          top={480} left={W / 2 - 112} rotate="-11deg" delay={300} duration={3800}
        />
        <FloatingCard
          colors={['#AA151B', '#F1BF00', '#AA151B']} label="ESP" size={58}
          top={485} right={W / 2 - 109} rotate="11deg" delay={600} duration={3700}
        />
        <FloatingCard
          colors={['#B22234', '#FFFFFF', '#3C3B6E']} label="USA" size={64}
          top={560} left={W / 2 - 32} rotate="3deg" delay={1200} duration={4400}
        />

        {/* Bottom text */}
        <View style={styles.heroText}>
          <Text style={styles.eyebrow}>Edición México</Text>
          <Text style={styles.display}>Estampas{'\n'}Mundial 2026</Text>
          <Text style={styles.bodyText}>
            Lleva el control de tu álbum físico, marca las repetidas y cambia con tus amigos sin abrir un sobre extra.
          </Text>
        </View>
      </View>

      {/* CTA panel */}
      <View style={[styles.cta, { backgroundColor: t.paper, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <HapticPress style={[styles.btn, { backgroundColor: t.pitch }]} onPress={onNext}>
          <Text style={[styles.btnText, { color: t.paper }]}>Empezar mi álbum</Text>
        </HapticPress>
        <Text style={[styles.disclaimer, { color: t.ink4 }]}>
          Gratis · sin cuenta obligatoria · 100% en tu dispositivo
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  hero: {
    flex: 1,
    backgroundColor: '#0E5B3A',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    paddingHorizontal: 26,
    paddingTop: 90,
    paddingBottom: 32,
  },
  buntingWrap: { position: 'absolute', top: 0, left: 0 },

  // transform applied inline (merged with animated translateY)
  stickerMain: {
    position: 'absolute',
    top: 120,
    width: CARD_W,
    height: CARD_H,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 12,
    zIndex: 2,
  },
  stickerCard: {
    width: CARD_W, height: CARD_H,
    backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden',
  },
  stickerNum: {
    position: 'absolute', top: 6, left: 8,
    fontFamily: fonts.mono, fontSize: 11, color: '#0E5B3A', zIndex: 2,
  },
  stickerArt: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 10 },
  stickerInit: {
    fontFamily: fonts.display, fontSize: 30,
    color: 'rgba(255,255,255,0.95)', letterSpacing: -1.2,
    textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  stickerFoot: { height: 18, backgroundColor: '#0E5B3A', alignItems: 'center', justifyContent: 'center' },
  stickerFootText: {
    fontFamily: fonts.headline, fontSize: 9,
    color: '#fff', letterSpacing: 0.6, textTransform: 'uppercase',
  },

  // transform applied inline
  stickerLeft: {
    position: 'absolute', top: 180, left: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 18, elevation: 8, zIndex: 1,
  },
  stickerRight: {
    position: 'absolute', top: 200, right: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 18, elevation: 8, zIndex: 1,
  },
  stickerSmall: { width: SMALL_W, height: SMALL_H, backgroundColor: '#fff', borderRadius: 6, overflow: 'hidden' },
  stickerSmallArt: { flex: 1 },
  stickerSmallFoot: { height: 12, backgroundColor: '#0E5B3A', alignItems: 'center', justifyContent: 'center' },
  stickerSmallFootText: {
    fontFamily: fonts.headline, fontSize: 7,
    color: '#fff', letterSpacing: 0.4, textTransform: 'uppercase',
  },

  heroText: { zIndex: 2 },
  eyebrow: {
    fontFamily: fonts.mono, fontSize: 10, color: '#E89B2F',
    textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 10,
  },
  display: {
    fontFamily: fonts.display, fontSize: 44, color: '#fff',
    letterSpacing: -1.5, lineHeight: 46, marginBottom: 10,
  },
  bodyText: {
    fontSize: 14, color: 'rgba(242,232,208,0.85)',
    lineHeight: 20, fontFamily: fonts.body, maxWidth: 300,
  },

  cta: { paddingHorizontal: 22, paddingTop: 20 },
  btn: { width: '100%', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 10 },
  btnText: { fontFamily: fonts.headline, fontSize: 16, letterSpacing: -0.2 },
  disclaimer: { textAlign: 'center', fontSize: 12, fontFamily: fonts.body },
});
