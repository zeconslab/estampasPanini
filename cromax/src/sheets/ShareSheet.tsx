import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation }  from '@react-navigation/native';
import { useAlbumStore }  from '../store/useAlbumStore';
import { encodeQR }       from '../utils/qr';
import { useTheme }       from '../theme';
import { HapticPress }    from '../components/HapticPress';

export function ShareSheet() {
  const t       = useTheme();
  const insets  = useSafeAreaInsets();
  const nav     = useNavigation();
  const { stickers, profile } = useAlbumStore();

  const payload = useMemo(
    () => encodeQR(profile?.name ?? 'Amigo', stickers),
    [stickers, profile]
  );

  const missingCount = stickers.filter(s => s.state === 'missing').length;

  return (
    <View style={[styles.container, { backgroundColor: t.paper, paddingBottom: insets.bottom + 20 }]}>
      <View style={[styles.handle, { backgroundColor: t.line }]} />
      <Text style={[styles.title, { color: t.ink }]}>Mi QR de faltantes</Text>
      <Text style={[styles.sub, { color: t.ink4 }]}>
        {missingCount} estampas faltantes · Que tu amigo escanee este QR
      </Text>

      <View style={[styles.qrBox, { backgroundColor: '#fff' }]}>
        <QRCode
          value={payload}
          size={220}
          color="#102A1F"
          backgroundColor="#ffffff"
        />
      </View>

      <Text style={[styles.name, { color: t.pitch }]}>{profile?.name ?? 'Mi álbum'}</Text>

      <View style={styles.btnRow}>
        <HapticPress
          style={[styles.btn, { backgroundColor: t.pitch }]}
          onPress={() => Share.share({ message: payload })}
        >
          <Text style={styles.btnText}>Compartir texto</Text>
        </HapticPress>
        <HapticPress style={[styles.btn, { backgroundColor: t.paper2 }]} onPress={() => nav.goBack()}>
          <Text style={[styles.btnText, { color: t.ink }]}>Cerrar</Text>
        </HapticPress>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  handle:    { width: 36, height: 4, borderRadius: 2, marginBottom: 20 },
  title:     { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  sub:       { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  qrBox:     { padding: 20, borderRadius: 20, marginBottom: 16, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 },
  name:      { fontSize: 18, fontWeight: '700', marginBottom: 24 },
  btnRow:    { flexDirection: 'row', gap: 12, width: '100%' },
  btn:       { flex: 1, borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  btnText:   { fontSize: 15, fontWeight: '700', color: '#EFE7D2' },
});
