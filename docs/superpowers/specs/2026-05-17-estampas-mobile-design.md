# Estampas — App Móvil Híbrida (iOS + Android)
**Fecha:** 2026-05-17
**Stack:** React Native + Expo (managed workflow)
**Alcance:** v1 — álbum local, QR sharing, sin backend

---

## 1. Contexto

El proyecto `Estampas` es un prototipo de diseño en React (web, sin build system) de una app de álbum de estampas para el Mundial 2026. El diseño visual está completamente resuelto: 4 pantallas principales, múltiples bottom sheets, estética folk mexicana con motivos de marigold y papel picado.

Este documento describe la migración de ese prototipo a una app nativa real con React Native + Expo.

---

## 2. Alcance v1

### Incluido
- Seguimiento de estampas: owned / missing / duplicate
- 4 pantallas: Álbum (Home), Cuadrícula, Trueque, Perfil
- Bottom sheets: StickerSheet, QuickAddSheet, FriendDetail, ShareSheet
- Compartir lista de faltantes via QR real
- Escanear QR de amigo → guardarlo localmente → ver matches de trueque
- Persistencia local con AsyncStorage
- Modo oscuro / claro
- Soporte iOS y Android

### Excluido (módulos futuros)
- Múltiples álbumes
- Cuentas de usuario / backend
- Amigos agregados manualmente (solo via QR scan)
- Notificaciones push

---

## 3. Stack tecnológico

| Necesidad | Librería |
|---|---|
| Proyecto base | Expo SDK (managed workflow) |
| Navegación | React Navigation v6 — Bottom Tabs + Modal Stack |
| Almacenamiento | `@react-native-async-storage/async-storage` |
| SVGs | `react-native-svg` |
| Bottom sheets | `@gorhom/bottom-sheet` |
| Feedback táctil | `expo-haptics` |
| Safe areas | `react-native-safe-area-context` |
| Fuentes | `expo-font` (Hanken Grotesk + JetBrains Mono) |
| QR generación | `react-native-qrcode-svg` |
| QR escaneo | `expo-barcode-scanner` |

---

## 4. Arquitectura

### Estructura de carpetas

```
estampas-app/
├── assets/
│   └── fonts/
│       ├── HankenGrotesk-Regular.ttf
│       ├── HankenGrotesk-Bold.ttf
│       ├── HankenGrotesk-SemiBold.ttf
│       └── JetBrainsMono-Regular.ttf
├── src/
│   ├── data/
│   │   └── album.ts          # copia directa de data.jsx — sin cambios
│   ├── theme.ts              # CSS variables → objeto JS (light + dark)
│   ├── components/
│   │   ├── HapticPressable.tsx
│   │   ├── Sticker.tsx
│   │   ├── ProgressRing.tsx
│   │   ├── Flag.tsx
│   │   ├── MxPattern.tsx
│   │   ├── MxBunting.tsx
│   │   └── SectionHeader.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── GridScreen.tsx
│   │   ├── TradeScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── sheets/
│       ├── StickerSheet.tsx
│       ├── FriendDetail.tsx
│       ├── ShareSheet.tsx
│       ├── QuickAddSheet.tsx
│       └── QRScannerSheet.tsx   # nuevo
├── App.tsx                   # orquestador — lógica de app.jsx migrada
└── app.json
```

### Navegación

```
RootNavigator (Stack — modal presentation)
├── MainTabs (Bottom Tabs)
│   ├── Álbum       → HomeScreen
│   ├── Estampas    → GridScreen
│   ├── Trueque     → TradeScreen
│   └── Yo          → ProfileScreen
└── Modals
    ├── StickerSheet
    ├── FriendDetail
    ├── ShareSheet
    ├── QuickAddSheet
    └── QRScannerSheet
```

---

## 5. Datos y persistencia

### AsyncStorage keys

| Key | Contenido |
|---|---|
| `estampa.stickers` | `JSON.stringify(Sticker[])` — estado completo del álbum |
| `estampa.friends` | `JSON.stringify(Friend[])` — amigos guardados via QR |
| `estampa.dark` | `'1'` o `'0'` |

### Inicialización

Al arrancar la app:
1. Leer `estampa.stickers` de AsyncStorage
2. Si existe → parsear y usar como estado inicial
3. Si no existe → llamar `generateAlbum(42)` y guardar

### Funciones que migran sin cambios (JavaScript puro)

- `generateAlbum(seed)` — genera las ~670 estampas del Mundial 2026
- `computeStats(stickers)` — owned, missing, dupes, pct
- `cycleQuick(sticker, mode)` — ciclo missing → owned → dup×2…
- `mulberry(seed)` — RNG determinístico
- `TEAMS`, `ALBUMS` — constantes de datos (la lista `FRIENDS` hardcodeada se elimina; en v1 los amigos vienen únicamente de QR scans guardados en AsyncStorage)

> **Adaptación requerida:** `computeFriendMatches` en el prototipo usa RNG para simular matches. En la app real recibe los amigos desde AsyncStorage (con sus `missing[]` y `dupes[]` reales del QR) y calcula matches por intersección directa: mis `dupes` ∩ sus `missing` y sus `dupes` ∩ mis `missing`.

---

## 6. Sistema de amigos via QR

### Flujo de compartir (emisor)

1. Usuario abre `ShareSheet`
2. La app genera un QR que codifica:
   ```json
   {
     "v": 1,
     "name": "Martín",
     "missing": [3, 7, 15, ...],
     "dupes": [{ "id": 42, "count": 2 }, ...]
   }
   ```
3. El amigo escanea con su app → `QRScannerSheet`

### Flujo de escanear (receptor)

1. Usuario abre `QRScannerSheet` (usa `expo-barcode-scanner`)
2. Escanea el QR del amigo
3. La app parsea el JSON y guarda en `estampa.friends`
4. El amigo aparece inmediatamente en `TradeScreen` con sus matches calculados

### Estructura de un Friend guardado

```ts
interface Friend {
  id: string;          // hash del QR o timestamp
  name: string;
  missing: number[];   // ids de estampas que le faltan
  dupes: { id: number; count: number }[];
  scannedAt: string;   // ISO date
}
```

---

## 7. Componentes — guía de migración

### Cambios mecánicos universales

| Web | React Native |
|---|---|
| `<div>` | `<View>` |
| `<span>`, `<p>` | `<Text>` |
| `<input>` | `<TextInput>` |
| `<button onClick>` | `<HapticPressable onPress>` |
| `className="scroll"` | `<ScrollView>` |
| CSS `styles.css` | `StyleSheet.create()` |
| Variables CSS `--primary` | `theme.primary` |

### SVGs — react-native-svg

Cambio de nombres de etiquetas (geometría idéntica):

| JSX web | react-native-svg |
|---|---|
| `<svg>` | `<Svg>` |
| `<path>` | `<Path>` |
| `<circle>` | `<Circle>` |
| `<ellipse>` | `<Ellipse>` |
| `<g>` | `<G>` |

`MxPattern`, `MxBunting` y `ProgressRing` usan solo estos 5 elementos.

### `HapticPressable` (nuevo)

Reemplaza el efecto CSS `.press` (scale on tap). Usa `Animated.scale` + `expo-haptics` (light impact).

### Bottom sheets

Todos los `<div className="sheet">` se convierten en `@gorhom/bottom-sheet`. El grab handle lo maneja la librería automáticamente.

---

## 8. Tema

Las variables CSS se convierten en un objeto de tema exportado desde `src/theme.ts`:

```ts
export const lightTheme = {
  primary:  '#E89B2F',
  lime:     '#D6F23F',
  coral:    '#D7263D',
  gold:     '#E8B23A',
  ink:      '#13171E',
  ink2:     '#3A3F48',
  ink3:     '#8A8F98',
  paper:    '#F5F0E8',
  card:     '#FFFFFF',
  pitch:    '#13171E',
};

export const darkTheme = {
  ...lightTheme,
  ink:   '#F5F0E8',
  paper: '#0D0D0D',
  card:  '#1A1A1A',
  pitch: '#F5F0E8',
};
```

Se pasa via React Context o props desde `App.tsx` (igual que el prototipo).

---

## 9. Plan de fases

| Fase | Contenido | Duración estimada |
|---|---|---|
| 1 | Setup Expo + datos + tema + AsyncStorage | 1-2 días |
| 2 | Navegación + skeleton de pantallas | 1 día |
| 3 | Componentes base (Sticker, Flag, ProgressRing, MxPattern, MxBunting, HapticPressable) | 2-3 días |
| 4 | Pantallas principales (Home, Grid, Trade, Profile) | 3-4 días |
| 5 | Bottom sheets (StickerSheet, QuickAdd, FriendDetail, Share, QRScanner) | 2-3 días |
| 6 | Pulido (animaciones, safe areas, icono, splash) | 1-2 días |

**Total estimado con Claude Code:** ~2 semanas

---

## 10. Comandos de setup

```bash
npx create-expo-app estampas --template blank-typescript
cd estampas

npx expo install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-svg
npx expo install @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler
npx expo install expo-haptics expo-font expo-barcode-scanner
npx expo install react-native-qrcode-svg

npx expo start
```
