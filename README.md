<div align="center">

```
 ██████╗██████╗  ██████╗ ███╗   ███╗ █████╗ ██╗  ██╗
██╔════╝██╔══██╗██╔═══██╗████╗ ████║██╔══██╗╚██╗██╔╝
██║     ██████╔╝██║   ██║██╔████╔██║███████║ ╚███╔╝ 
██║     ██╔══██╗██║   ██║██║╚██╔╝██║██╔══██║ ██╔██╗ 
╚██████╗██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║██╔╝ ██╗
 ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
```

### Tu álbum físico del Mundial 2026, en tu bolsillo.

<br/>

[![Expo](https://img.shields.io/badge/Expo-54.0-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.79-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Zustand](https://img.shields.io/badge/Zustand-5.x-433E38?style=for-the-badge)](https://zustand-demo.pmnd.rs)
[![License](https://img.shields.io/badge/License-MIT-E89B2F?style=for-the-badge)](LICENSE)

<br/>

<img src="https://img.shields.io/badge/iOS-compatible-0E5B3A?style=flat-square&logo=apple&logoColor=white"/>
<img src="https://img.shields.io/badge/Android-compatible-0E5B3A?style=flat-square&logo=android&logoColor=white"/>
<img src="https://img.shields.io/badge/Dark%20Mode-supported-0E5B3A?style=flat-square"/>
<img src="https://img.shields.io/badge/Sin%20cuenta-100%%20local-0E5B3A?style=flat-square"/>

</div>

---

## Qué es Cromax

Cromax es la app compañera para el álbum físico de estampas del **FIFA World Cup 2026 — Edición México**. Sin servidores, sin cuentas obligatorias. Todo vive en tu dispositivo.

Marca las estampas que ya tienes, anota tus repetidas, y genera un código QR para intercambiar con tus amigos en segundos.

---

## Funciones principales

| Función | Descripción |
|---|---|
| **Album completo** | 980 estampas base · 16 selecciones · escudos, jugadores, especiales y leyendas |
| **Coca-Cola** | 14 estampas exclusivas del álbum físico mexicano, activables por toggle |
| **Ciclo rápido** | Toca una estampa para marcarla como tenida → repetida → faltante |
| **Grid por equipo** | Navega por país, filtra por estado, busca por nombre |
| **QR de trueque** | Genera y escanea un código QR con tus faltantes y repetidas |
| **Sistema de amigos** | Guarda los perfiles de amigos y ve qué pueden intercambiarse |
| **Modo oscuro** | Tema claro y oscuro automático según el sistema |
| **Sin cuenta** | Todo se guarda localmente con persistencia entre sesiones |

---

## Álbum en números

```
┌─────────────────────────────────────────────────────┐
│  FIFA WORLD CUP 2026 · EDICIÓN MÉXICO               │
│                                                     │
│  Especiales ............ 5   (trofeo, mascota…)     │
│  Escudos .............. 16   (1 por selección)      │
│  Jugadores ........... 320   (20 por selección)     │
│  Leyendas ............. 10   (cierran el álbum)     │
│  ─────────────────────────────────────────          │
│  Base total .......... 980   estampas               │
│  + Coca-Cola .......... 14   (opcional, México)     │
│  ═════════════════════════════════════════          │
│  Máximo .............. 994   estampas               │
└─────────────────────────────────────────────────────┘

  Selecciones: MEX · ARG · BRA · FRA · ESP · ENG
               GER · USA · POR · NED · BEL · CRO
               URU · COL · SEN · JPN
```

---

## Stack técnico

```
cromax/
├── Expo 54 (New Architecture)
├── React Native 0.79
├── TypeScript 5
│
├── Navegación
│   └── React Navigation 7 — Bottom Tabs + Stack
│
├── Estado
│   └── Zustand 5 + AsyncStorage (persistencia)
│
├── UI / Animaciones
│   ├── Reanimated 3
│   ├── Gesture Handler
│   ├── expo-linear-gradient
│   ├── expo-haptics
│   └── @gorhom/bottom-sheet
│
├── Fuentes
│   ├── Hanken Grotesk (display, headline, body)
│   └── JetBrains Mono (mono)
│
└── QR
    ├── react-native-qrcode-svg (generación)
    └── expo-camera (escaneo)
```

---

## Estructura del proyecto

```
cromax/
├── App.tsx                    # Entry point — fuentes + navegación
├── index.ts
├── app.json                   # Config Expo (bundle IDs, permisos)
├── eas.json                   # Config EAS Build
│
├── assets/                    # Íconos y splash
│
└── src/
    ├── theme.ts               # Tokens de diseño · colores · fuentes
    ├── data/
    │   └── album.ts           # Modelo de estampas · TEAMS · ALBUMS
    ├── store/
    │   └── useAlbumStore.ts   # Estado global con Zustand
    ├── components/
    │   ├── HapticPress.tsx    # Botón con feedback háptico
    │   ├── Sticker.tsx        # Tarjeta de estampa
    │   ├── ProgressRing.tsx   # Anillo de progreso SVG
    │   ├── Flag.tsx           # Bandera de selección
    │   ├── MxBunting.tsx      # Decoración de banderines mexicanos
    │   ├── MxPattern.tsx      # Patrón de fondo tema México
    │   ├── SectionHeader.tsx  # Cabecera de sección
    │   └── Icons.tsx          # Iconografía de la app
    ├── navigation/
    │   ├── RootNavigator.tsx  # Onboarding ↔ app principal
    │   ├── MainTabs.tsx       # Bottom tab navigator
    │   └── CustomTabBar.tsx   # Tab bar flotante con pill animado
    ├── screens/
    │   ├── HomeScreen.tsx     # Dashboard · stats · acceso rápido
    │   ├── GridScreen.tsx     # Grid de estampas por equipo
    │   ├── TradeScreen.tsx    # Amigos y trueques
    │   └── ProfileScreen.tsx  # Perfil y configuración
    ├── sheets/
    │   ├── StickerSheet.tsx   # Detalle de estampa
    │   ├── QuickAddSheet.tsx  # Agregar estampas rápido
    │   ├── ScanSheet.tsx      # Escanear QR de amigo
    │   ├── ShareSheet.tsx     # Generar y compartir QR
    │   └── FriendDetailSheet.tsx # Detalle de amigo + matches
    ├── onboarding/
    │   ├── OnboardingFlow.tsx # Orquestador con transiciones
    │   ├── OnboardWelcome.tsx # Pantalla de bienvenida
    │   ├── OnboardAlbum.tsx   # Selección de álbum + toggle Coca-Cola
    │   ├── OnboardName.tsx    # Nombre del coleccionista
    │   ├── OnboardAge.tsx     # Rango de edad
    │   ├── OnboardReady.tsx   # Confirmación y arranque
    │   └── OnboardingShell.tsx # Shell compartido (nav + dots)
    └── utils/
        └── qr.ts              # Encode/decode de payload QR
```

---

## Instalación y desarrollo

### Prerrequisitos

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go en tu dispositivo, o un simulador iOS/Android

### Pasos

```bash
# 1. Clona el repo
git clone https://github.com/zeconslab/estampasPanini.git
cd estampasPanini

# 2. Instala dependencias
npm install

# 3. Arranca el servidor de desarrollo
npx expo start

# 4. Escanea el QR con Expo Go, o presiona:
#    i  →  simulador iOS
#    a  →  emulador Android
```

### Build de producción (EAS)

```bash
# Preview (interno)
eas build --profile preview --platform ios

# Producción
eas build --profile production --platform all
```

---

## Flujo de la app

```
  Primer arranque
       │
       ▼
  ┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌────────────┐     ┌──────────────┐
  │  Bienvenida │────▶│  Elige álbum │────▶│   Nombre    │────▶│    Edad    │────▶│    Listo!    │
  │  + stickers │     │  + Coca-Cola │     │  + avatar   │     │  (buckets) │     │  Resumen     │
  └─────────────┘     └──────────────┘     └─────────────┘     └────────────┘     └──────┬───────┘
                                                                                          │
                                                                                          ▼
                                                                              ┌───────────────────────┐
                                                                              │      App Principal    │
                                                                              │                       │
                                                                              │  Home · Grid · Trade  │
                                                                              │  Profile              │
                                                                              └───────────────────────┘
```

---

## Diseño y temas

La app usa un sistema de tokens centralizado (`src/theme.ts`) con soporte completo de modo claro y oscuro.

```
Color principal   #0E5B3A  Verde mexicano
Acento            #E89B2F  Dorado FIFA
Fondo (light)     #F2E8D0  Papel pergamino
Fondo (dark)      #1A1A1A  Noche
```

El tab bar flota sobre el contenido con un pill animado que sigue la pestaña activa. Los bottom sheets usan detección de gestos nativa para un feel 100% nativo.

---

## Contribuir

Este proyecto es open source. PRs bienvenidos.

```bash
# Crea tu branch
git checkout -b feat/tu-feature

# Haz tus cambios y commitea
git commit -m "feat: descripción clara del cambio"

# Sube y abre un PR
git push origin feat/tu-feature
```

---

## Autor

**Raul Pimentel** · [@zeconslab](https://github.com/zeconslab)

<div align="center">

---

*Hecho con React Native · Expo · y mucho fútbol*

[![GitHub](https://img.shields.io/badge/github-zeconslab-0E5B3A?style=for-the-badge&logo=github&logoColor=white)](https://github.com/zeconslab)

</div>
