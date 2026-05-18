import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation }  from '@react-navigation/native';
import { useAlbumStore }  from '../store/useAlbumStore';
import { cycleQuick }     from '../data/album';
import { useTheme }       from '../theme';
import { Sticker as StickerComponent } from '../components/Sticker';
import { HapticPress }    from '../components/HapticPress';

const COLS = 6;
const GAP  = 6;
const PAD  = 12;
const CELL = Math.floor((Dimensions.get('window').width - PAD * 2 - GAP * (COLS - 1)) / COLS);

export function QuickAddSheet() {
  const t       = useTheme();
  const insets  = useSafeAreaInsets();
  const nav     = useNavigation();
  const { stickers, setStickers } = useAlbumStore();
  const [local, setLocal] = useState(stickers);

  const handlePress = (id: number) => {
    setLocal(prev => prev.map(s => s.id === id ? cycleQuick(s) : s));
  };

  const handleDone = () => {
    setStickers(local);
    nav.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: t.paper }]}>
      <View style={[styles.header, { backgroundColor: t.paper }]}>
        <Text style={[styles.title, { color: t.ink }]}>Marcar rápido</Text>
        <Text style={[styles.sub, { color: t.ink4 }]}>Toca para ciclar: falta → tengo → repetida</Text>
      </View>
      <FlatList
        data={local}
        keyExtractor={s => String(s.id)}
        numColumns={COLS}
        contentContainerStyle={{ padding: PAD, gap: GAP, paddingBottom: insets.bottom + 80 }}
        columnWrapperStyle={{ gap: GAP }}
        renderItem={({ item }) => (
          <StickerComponent sticker={item} size={CELL} onPress={s => handlePress(s.id)} />
        )}
      />
      <View style={[styles.footer, { paddingBottom: insets.bottom + 8, backgroundColor: t.paper }]}>
        <HapticPress style={[styles.doneBtn, { backgroundColor: t.pitch }]} onPress={handleDone}>
          <Text style={styles.doneBtnText}>Guardar cambios</Text>
        </HapticPress>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header:    { padding: 16, paddingBottom: 8 },
  title:     { fontSize: 20, fontWeight: '800' },
  sub:       { fontSize: 13, marginTop: 4 },
  footer:    { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  doneBtn:   { borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  doneBtnText: { color: '#EFE7D2', fontSize: 16, fontWeight: '700' },
});
