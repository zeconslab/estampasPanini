import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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

export function OnboardWelcome({ onNext }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      {/* Green hero panel — fills all remaining space */}
      <View style={styles.hero}>
        <View style={styles.buntingWrap}><MxBunting /></View>

        {/* Main sticker — centered, tilted */}
        <View style={[styles.stickerMain, { left: W / 2 - CARD_W / 2 }]}>
          <View style={styles.stickerCard}>
            <Text style={styles.stickerNum}>MEX 01</Text>
            <LinearGradient
              colors={['#006847', '#FFFFFF', '#CE1126']}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.stickerArt}
            >
              <Text style={styles.stickerInit}>OCH</Text>
            </LinearGradient>
            <View style={styles.stickerFoot}>
              <Text style={styles.stickerFootText}>MEX</Text>
            </View>
          </View>
        </View>

        {/* Secondary sticker — Argentina, left */}
        <View style={styles.stickerLeft}>
          <View style={styles.stickerSmall}>
            <LinearGradient
              colors={['#75AADB', '#FFFFFF', '#75AADB']}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.stickerSmallArt}
            />
            <View style={styles.stickerSmallFoot}><Text style={styles.stickerSmallFootText}>ARG</Text></View>
          </View>
        </View>

        {/* Secondary sticker — Brazil, right */}
        <View style={styles.stickerRight}>
          <View style={styles.stickerSmall}>
            <LinearGradient
              colors={['#FEDF00', '#009C3B', '#002776']}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.stickerSmallArt}
            />
            <View style={styles.stickerSmallFoot}><Text style={styles.stickerSmallFootText}>BRA</Text></View>
          </View>
        </View>

        {/* Bottom text */}
        <View style={styles.heroText}>
          <Text style={styles.eyebrow}>Edición México</Text>
          <Text style={styles.display}>Estampas{'\n'}Mundial 2026</Text>
          <Text style={styles.bodyText}>
            Lleva el control de tu álbum físico, marca las repetidas y cambia con tus amigos sin abrir un sobre extra.
          </Text>
        </View>
      </View>

      {/* CTA panel — natural height, anchored to bottom */}
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
  buntingWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  stickerMain: {
    position: 'absolute',
    top: 120,
    width: CARD_W,
    height: CARD_H,
    transform: [{ rotate: '-6deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 12,
    zIndex: 2,
  },
  stickerCard: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  stickerNum: {
    position: 'absolute',
    top: 6,
    left: 8,
    fontFamily: fonts.mono,
    fontSize: 11,
    color: '#0E5B3A',
    zIndex: 2,
  },
  stickerArt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  stickerInit: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: -1.2,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  stickerFoot: {
    height: 18,
    backgroundColor: '#0E5B3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerFootText: {
    fontFamily: fonts.headline,
    fontSize: 9,
    color: '#fff',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  stickerLeft: {
    position: 'absolute',
    top: 180,
    left: 24,
    transform: [{ rotate: '-14deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
    zIndex: 1,
  },
  stickerRight: {
    position: 'absolute',
    top: 200,
    right: 20,
    transform: [{ rotate: '12deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
    zIndex: 1,
  },
  stickerSmall: {
    width: SMALL_W,
    height: SMALL_H,
    backgroundColor: '#fff',
    borderRadius: 6,
    overflow: 'hidden',
  },
  stickerSmallArt: { flex: 1 },
  stickerSmallFoot: {
    height: 12,
    backgroundColor: '#0E5B3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerSmallFootText: {
    fontFamily: fonts.headline,
    fontSize: 7,
    color: '#fff',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  heroText: { zIndex: 2 },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: '#E89B2F',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  display: {
    fontFamily: fonts.display,
    fontSize: 44,
    color: '#fff',
    letterSpacing: -1.5,
    lineHeight: 46,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 14,
    color: 'rgba(242,232,208,0.85)',
    lineHeight: 20,
    fontFamily: fonts.body,
    maxWidth: 300,
  },

  cta: { paddingHorizontal: 22, paddingTop: 20 },
  btn: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnText: {
    fontFamily: fonts.headline,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: fonts.body,
  },
});
