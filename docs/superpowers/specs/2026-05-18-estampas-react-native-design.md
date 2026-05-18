# Estampas — App Nativa iOS + Android
**Fecha:** 2026-05-18
**Stack:** React Native + Expo Managed Workflow
**Alcance:** v1 — álbum local, compartir faltantes por QR (bitmask), sin backend

---

## 1. Contexto

`Estampas` es un tracker de álbum físico de estampas para el Mundial 2026. El diseño visual está completamente resuelto en un prototipo HTML/CSS/React (`index.html` en la raíz del repo): 4 pantallas principales, múltiples bottom sheets, estética folk mexicana con papel picado y motivos de marigold.

Este documento describe la migración de ese prototipo a una app nativa publicable en App Store y Play Store.

---

## 2. Alcance v1

### Incluido
- Seguimiento de estampas: owned / missing / duplicate con contador
- Onboarding de 5 pasos con transiciones de página
- 4 pantallas: Álbum (Home), Cuadrícula, Trueque, Perfil
- Bottom sheets: StickerSheet, QuickAddSheet, FriendDetailSheet, ShareSheet, ScanSheet
- Compartir lista de faltantes via QR generado (codificación bitmask)
- Escanear QR del amigo → guardar → calcular matches reales de trueque
- Persistencia local con AsyncStorage
- Modo oscuro / claro con persistencia
- Soporte iOS y Android
- Tab bar personalizado (pill marigold deslizante)

### Excluido de v1
- Múltiples álbumes (el selector existe en UI pero solo Mundial 2026 es activo)
- Cuentas de usuario / sync en la nube
- Notificaciones push
- Chat entre usuarios

---

## 3. Stack tecnológico

| Necesidad | Librería |
|---|---|
| Base | Expo SDK — managed workflow |
| Lenguaje | TypeScript |
| Navegación | React Navigation v6 — Bottom Tabs + Stack modal |
| Almacenamiento | `@react-native-async-storage/async-storage` |
| SVGs | `react-native-svg` |
| Bottom sheets | `@gorhom/bottom-sheet` |
| Feedback táctil | `expo-haptics` |
| Safe areas | `react-native-safe-area-context` |
| Fuentes | `expo-font` (Hanken Grotesk + JetBrains Mono) |
| QR generación | `react-native-qrcode-svg` |
| QR escaneo | `expo-camera` (modo barcode) |
| Animaciones | `react-native-reanimated` (requerido por bottom-sheet) |
| Gestos | `react-native-gesture-handler` (requerido por bottom-sheet) |
| Build / publish | EAS Build + EAS Submit |

---

## 4. Arquitectura y estructura de carpetas

```
estampas/
├── app.json                        # config Expo: nombre, íconos, splash, permisos cámara
├── App.tsx                         # punto de entrada — orquestador (replica app.jsx)
├── src/
│   ├── theme.ts                    # CSS vars → objeto JS (light + dark)
│   ├── data/
│   │   └── album.ts                # TEAMS, generateAlbum(), computeStats() — sin cambios
│   ├── store/
│   │   └── useAlbumStore.ts        # AsyncStorage: stickers, friends, perfil, dark
│   ├── components/
│   │   ├── HapticPress.tsx         # Pressable + Animated.spring + expo-haptics
│   │   ├── Sticker.tsx             # célula 5:7 con estados owned/missing/duplicate
│   │   ├── ProgressRing.tsx        # anillo SVG de progreso
│   │   ├── Flag.tsx                # banderita de selección (3 franjas)
│   │   ├── MxPattern.tsx           # SVG motivos folk (esquinas)
│   │   ├── MxBunting.tsx           # SVG banderines papel picado
│   │   └── SectionHeader.tsx       # título de sección + trailing
│   ├── navigation/
│   │   ├── RootNavigator.tsx       # Stack raíz (tabs + modals)
│   │   ├── MainTabs.tsx            # Bottom Tabs con tab bar personalizado
│   │   └── CustomTabBar.tsx        # Tab bar: fondo pitch, pill marigold animado
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Hero verde + stats + matches de trueque
│   │   ├── GridScreen.tsx          # Cuadrícula 6 cols + búsqueda + filtros
│   │   ├── TradeScreen.tsx         # Lista de amigos + "cómo funciona"
│   │   └── ProfileScreen.tsx       # Perfil + álbumes + ajustes + tip voluntario
│   ├── sheets/
│   │   ├── StickerSheet.tsx        # Detalle + cambiar estado + stepper duplicados
│   │   ├── QuickAddSheet.tsx       # Marcar pegadas rápido (tap-cycle por selección)
│   │   ├── FriendDetailSheet.tsx   # Matches 1×1 con un amigo
│   │   ├── ShareSheet.tsx          # QR generado + bitmask de faltantes
│   │   └── ScanSheet.tsx           # Cámara + decodificación + guardar amigo
│   └── onboarding/
│       ├── OnboardingFlow.tsx      # Orquestador de pasos con transición slide
│       ├── OnboardWelcome.tsx      # Hero verde + CTA
│       ├── OnboardAlbum.tsx        # Selección de álbum
│       ├── OnboardName.tsx         # Input de nombre
│       ├── OnboardAge.tsx          # Selector de rango de edad
│       └── OnboardReady.tsx        # Pantalla de confirmación
```

**Principio:** cada archivo del prototipo mapea 1-a-1 a uno o dos archivos en la app. No hay reescritura conceptual — solo traducción de sintaxis.

---

## 5. Datos y persistencia

### AsyncStorage keys

| Key | Contenido |
|---|---|
| `estampa.stickers` | `Sticker[]` serializado — estado completo del álbum |
| `estampa.friends` | `Friend[]` serializado — amigos guardados via QR |
| `estampa.profile` | `{ albumId, name, age }` del onboarding |
| `estampa.dark` | `'1'` o `'0'` |

### Inicialización

Al arrancar `App.tsx`:
1. Leer `estampa.stickers` de AsyncStorage
2. Si existe → usarlo como estado inicial
3. Si no existe → `generateAlbum(42)` y guardar en AsyncStorage

### Funciones que migran sin cambios

Son JavaScript puro, no dependen del DOM ni de React web:

- `generateAlbum(seed)` — genera todas las estampas del álbum
- `computeStats(stickers)` — owned, missing, dupes, pct
- `cycleQuick(sticker, mode)` — missing → owned → ×2 → ×3 → missing
- `mulberry(seed)` — RNG determinístico

### Tipos principales

```ts
interface Sticker {
  id: number;
  type: 'player' | 'shield' | 'special' | 'legend';
  team: string | null;
  teamNum?: number;
  label: string;
  name: string;
  state: 'owned' | 'missing' | 'duplicate';
  count: number; // repetidas adicionales (0 si no es duplicate)
}

interface Friend {
  id: string;          // timestamp ISO del escaneo
  name: string;
  missing: number[];   // ids de estampas que le faltan
  dupes: { id: number; count: number }[];
  scannedAt: string;
}
```

---

## 6. Flujo QR — codificación bitmask

### Por qué bitmask

Con hasta ~1000 estampas y potencialmente 700+ faltantes, un array de IDs en JSON crece proporcional al número de faltantes. El bitmask tiene tamaño **fijo** independientemente de cuántas estampas falten:

- 1000 estampas = 1000 bits = 125 bytes → base64 = **168 chars siempre**
- QR nivel M soporta ~2335 chars alfanuméricos. El payload total (~400 chars) nunca acerca ese límite.

### Formato del payload QR

```json
{
  "v": 1,
  "n": "Martín",
  "m": "<base64 bitmask missing — 168 chars>",
  "d": "22:2,97:1,145:3"
}
```

- `v` — versión del protocolo (permite cambios futuros sin romper QRs viejos)
- `n` — nombre del emisor (max 30 chars)
- `m` — bitmask de faltantes en base64: bit `i` = 1 si sticker `id=i+1` falta
- `d` — lista compacta de duplicados: `id:extra_count` separados por coma (solo los que tienen duplicados, típicamente < 100)

### Encoding (ShareSheet)

```ts
function encodeQR(name: string, stickers: Sticker[]): string {
  const total = stickers.length;
  const bytes = new Uint8Array(Math.ceil(total / 8));
  stickers.forEach((s, i) => {
    if (s.state === 'missing') bytes[i >> 3] |= (1 << (i & 7));
  });
  const m = btoa(String.fromCharCode(...bytes));
  const d = stickers
    .filter(s => s.state === 'duplicate')
    .map(s => `${s.id}:${s.count}`)
    .join(',');
  return JSON.stringify({ v: 1, n: name.slice(0, 30), m, d });
}
```

### Decoding (ScanSheet)

```ts
function decodeQR(raw: string): Friend | null {
  try {
    const { v, n, m, d } = JSON.parse(raw);
    if (v !== 1 || !m) return null;
    const bytes = Uint8Array.from(atob(m), c => c.charCodeAt(0));
    const missing: number[] = [];
    bytes.forEach((byte, bi) => {
      for (let bit = 0; bit < 8; bit++) {
        if (byte & (1 << bit)) missing.push(bi * 8 + bit + 1);
      }
    });
    const dupes = d ? d.split(',').map((p: string) => {
      const [id, count] = p.split(':');
      return { id: Number(id), count: Number(count) };
    }) : [];
    return { id: Date.now().toString(), name: n, missing, dupes, scannedAt: new Date().toISOString() };
  } catch { return null; }
}
```

### Flujo completo (emisor → receptor)

```
Emisor                          Receptor
──────                          ────────
[ShareSheet]                    [ScanSheet]
  encodeQR()                      expo-camera activa
  → QR mostrado en pantalla         └─ detecta QR
                                    decodeQR(raw)
                                    → Friend guardado en AsyncStorage
                                    → navegar a TradeScreen
                                    → calcular matches reales:
                                       mis dupes ∩ sus missing
                                       sus dupes ∩ mis missing
```

### Permisos de cámara

Declarados en `app.json` — Expo los inyecta automáticamente:
```json
"ios":     { "infoPlist": { "NSCameraUsageDescription": "Para escanear el QR de tus amigos y ver sus faltantes." } },
"android": { "permissions": ["CAMERA"] }
```

---

## 7. Migración de componentes

### Traducción de primitivos

| Web (prototipo) | React Native |
|---|---|
| `<div>` | `<View>` |
| `<span>`, texto inline | `<Text>` |
| `<input>` | `<TextInput>` |
| `<button onClick>` | `<HapticPress onPress>` |
| CSS `.press` (scale on tap) | `Animated.spring` en `HapticPress.tsx` |
| `className="scroll"` | `<ScrollView>` o `<FlatList>` |
| `styles.css` con variables CSS | `theme.ts` — objeto JS pasado como prop/context |
| `<div className="sheet">` | `@gorhom/bottom-sheet` |
| SVG inline `<svg><path>` | `<Svg><Path>` (react-native-svg) |

### SVGs — react-native-svg

`MxPattern` y `MxBunting` usan solo: `Path`, `Circle`, `Ellipse`, `G`, `Svg`.
Migración: capitalizar nombres de etiqueta e importar del paquete. La geometría (coordenadas, `d=`, colores) no cambia.

### HapticPress.tsx

Reemplaza el efecto CSS `.press:active { transform: scale(0.97) }`:

```tsx
// Animated.spring al presionar + expo-haptics light impact
// onPress recibe el callback del padre
// children se escala de 1.0 → 0.97 → 1.0
```

### Bottom sheets

Todos los `<div className="sheet">` del prototipo se convierten en `BottomSheet` de `@gorhom/bottom-sheet`. El grab handle lo maneja la librería. Los snap points se definen por pantalla.

### CustomTabBar

El tab bar del prototipo usa `getBoundingClientRect` para posicionar el pill. En React Native se usa `onLayout` en cada tab para medir y calcular la posición del `Animated.View` del pill. La curva de animación (`cubic-bezier(.34,1.24,.5,1)`) se replica con `Animated.spring({ tension: 120, friction: 8 })`.

---

## 8. Tema

Las variables CSS se exportan como objetos TypeScript desde `src/theme.ts`:

```ts
export const lightTheme = {
  paper:    '#EFE7D2',
  paper2:   '#E5DCC2',
  card:     '#FBF5E4',
  ink:      '#102A1F',
  ink2:     '#2F4338',
  ink3:     '#6A7569',
  ink4:     '#9AA39B',
  line:     'rgba(16,42,31,0.10)',
  primary:  '#E89B2F',  // marigold — CTAs
  lime:     '#B5DA40',  // chartreuse — tengo
  coral:    '#D7263D',  // rojo mexicano — faltan
  gold:     '#E89B2F',  // marigold — repetidas
  pitch:    '#0E5B3A',  // verde hero
  pitch2:   '#1A7B4F',
};

export const darkTheme: typeof lightTheme = {
  ...lightTheme,
  paper:  '#0D1715',
  paper2: '#142220',
  card:   '#172724',
  ink:    '#F0E8D2',
  ink2:   '#C7BFA8',
  ink3:   '#8F8973',
  ink4:   '#5F5C4F',
  pitch:  '#1A7B4F',
};

export type Theme = typeof lightTheme;
```

Se pasa via React Context desde `App.tsx` — igual que el prototipo pasa `dark` como prop.

---

## 9. Fases de implementación

| Fase | Contenido |
|---|---|
| **1 — Setup** | `create-expo-app`, instalar dependencias, fuentes, tema, AsyncStorage store |
| **2 — Navegación** | RootNavigator, MainTabs, CustomTabBar con pill animado |
| **3 — Componentes base** | HapticPress, Sticker, ProgressRing, Flag, MxPattern, MxBunting, SectionHeader |
| **4 — Onboarding** | 5 pasos con transiciones slide, persistencia en AsyncStorage |
| **5 — Pantallas principales** | HomeScreen, GridScreen, TradeScreen, ProfileScreen |
| **6 — Bottom sheets** | StickerSheet, QuickAddSheet, FriendDetailSheet |
| **7 — QR** | ShareSheet (encode bitmask + mostrar QR), ScanSheet (expo-camera + decode + guardar) |
| **8 — Pulido** | Safe areas, ícono app, splash screen, dark mode, pruebas en simulador |

---

## 10. Comandos de setup

```bash
npx create-expo-app estampas-app --template blank-typescript
cd estampas-app

npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-svg
npx expo install @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler
npx expo install expo-haptics expo-font expo-camera
npx expo install react-native-qrcode-svg

npx expo start
```
