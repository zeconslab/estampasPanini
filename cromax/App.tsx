import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';
import { useFonts, HankenGrotesk_400Regular, HankenGrotesk_600SemiBold, HankenGrotesk_700Bold, HankenGrotesk_800ExtraBold } from '@expo-google-fonts/hanken-grotesk';
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { useAlbumStore }   from './src/store/useAlbumStore';
import { ThemeContext, lightTheme, darkTheme } from './src/theme';
import { RootNavigator }   from './src/navigation/RootNavigator';
import { OnboardingFlow }  from './src/onboarding/OnboardingFlow';

export default function App() {
  const { hydrated, dark, profile, hydrate } = useAlbumStore();
  const theme = dark ? darkTheme : lightTheme;

  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  useEffect(() => { hydrate(); }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  if (!hydrated || !fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0E5B3A' }}>
        <ActivityIndicator color="#E89B2F" size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeContext.Provider value={theme}>
          <StatusBar style={dark ? 'light' : 'dark'} />
          {profile ? (
            <RootNavigator />
          ) : (
            <OnboardingFlow onComplete={() => {}} />
          )}
        </ThemeContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
