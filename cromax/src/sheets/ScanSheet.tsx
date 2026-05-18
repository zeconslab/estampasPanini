import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation }  from '@react-navigation/native';
import { useAlbumStore }  from '../store/useAlbumStore';
import { decodeQR }       from '../utils/qr';
import { useTheme }       from '../theme';
import { HapticPress }    from '../components/HapticPress';
import * as Haptics       from 'expo-haptics';

export function ScanSheet() {
  const t        = useTheme();
  const insets   = useSafeAreaInsets();
  const nav      = useNavigation();
  const addFriend = useAlbumStore(s => s.addFriend);

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCode = useCallback(({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const decoded = decodeQR(data);
    if (!decoded) {
      Alert.alert('QR no válido', 'Este QR no es de Cromax.', [
        { text: 'Reintentar', onPress: () => setScanned(false) },
        { text: 'Cancelar', onPress: () => nav.goBack() },
      ]);
      return;
    }

    const friend = {
      id:        Date.now().toString(),
      name:      decoded.name,
      missing:   decoded.missing,
      dupes:     decoded.dupes,
      scannedAt: new Date().toISOString(),
    };

    addFriend(friend);
    Alert.alert(
      '¡Amigo guardado!',
      `Se guardó el álbum de ${decoded.name}.`,
      [{ text: 'Ver trueques', onPress: () => { nav.goBack(); } }]
    );
  }, [scanned, addFriend, nav]);

  if (!permission) return <View style={{ flex: 1 }} />;

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: t.paper }]}>
        <Text style={[styles.permText, { color: t.ink }]}>
          Necesitamos acceso a la cámara para escanear el QR de tus amigos.
        </Text>
        <HapticPress style={[styles.permBtn, { backgroundColor: t.pitch }]} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Permitir cámara</Text>
        </HapticPress>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCode}
      />
      {/* Finder overlay */}
      <View style={styles.overlay}>
        <View style={[styles.finder, { borderColor: t.primary }]} />
        <Text style={styles.hint}>Apunta al QR de tu amigo</Text>
      </View>
      {/* Close button */}
      <HapticPress
        style={[styles.closeBtn, { top: insets.top + 16, backgroundColor: 'rgba(0,0,0,0.5)' }]}
        onPress={() => nav.goBack()}
      >
        <Text style={styles.closeBtnText}>✕</Text>
      </HapticPress>
    </View>
  );
}

const styles = StyleSheet.create({
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  permText:     { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  permBtn:      { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24 },
  permBtnText:  { color: '#EFE7D2', fontSize: 16, fontWeight: '700' },
  overlay:      { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  finder:       { width: 240, height: 240, borderWidth: 3, borderRadius: 20 },
  hint:         { color: '#fff', marginTop: 20, fontSize: 14, fontWeight: '600', textShadowColor: '#000', textShadowRadius: 8 },
  closeBtn:     { position: 'absolute', right: 16, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#fff', fontSize: 18 },
});
