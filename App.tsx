import { Platform, View } from 'react-native';
import { Routes } from './src/routes';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from 'react-native-rapi-ui'
import * as SplashScreen from 'expo-splash-screen'
import * as NavigationBar from 'expo-navigation-bar'
import * as SystemUI from 'expo-system-ui'

import { TourGuideProvider } from 'rn-tourguide'

import {
  useFonts,
  Orbitron_400Regular,
  Orbitron_500Medium,
  Orbitron_700Bold
} from '@expo-google-fonts/orbitron'
import { useCallback, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/config/toastConfig';
import { GestureHandlerRootView} from 'react-native-gesture-handler'

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Orbitron_400Regular,
    Orbitron_500Medium,
    Orbitron_700Bold
  })

  useEffect(() => {
    async function configurateSystem() {
      if (Platform.OS === 'android') {
        await SystemUI.setBackgroundColorAsync('#121212')
        await NavigationBar.setVisibilityAsync('hidden')
        await NavigationBar.setStyle('dark')
      }
    }
    configurateSystem();
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if(fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded])

  if(!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} >
      <View style={{flex: 1, backgroundColor: '#121212'}} onLayout={onLayoutRootView}>
          <ThemeProvider theme='dark'>
      <TourGuideProvider
        androidStatusBarVisible={true}
        backdropColor='rgba(0, 0, 0, 0.7)'
        labels={{
          previous: 'Anterior',
          next: 'Próximo',
          skip: 'Pular',
          finish: 'Ir para o Passaporte.'
        }}
      >
            <StatusBar style='light' backgroundColor='transparent' translucent/>
            <Routes />

            <Toast config={toastConfig} />
        </TourGuideProvider>
          </ThemeProvider>
      </View>
    </GestureHandlerRootView>
  );
}
