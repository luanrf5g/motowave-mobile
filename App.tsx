import { GestureHandlerRootView} from 'react-native-gesture-handler'
import { useCallback, useEffect } from 'react';
import { Platform, View } from 'react-native';
import { ThemeProvider } from 'react-native-rapi-ui'
import Toast from 'react-native-toast-message';

import * as SplashScreen from 'expo-splash-screen'
import * as NavigationBar from 'expo-navigation-bar'
import * as SystemUI from 'expo-system-ui'
import { StatusBar } from 'expo-status-bar';

import { Routes } from './src/routes';
import { toastConfig } from './src/config/toastConfig';

import {
  useFonts,
  Orbitron_400Regular,
  Orbitron_500Medium,
  Orbitron_700Bold
} from '@expo-google-fonts/orbitron'

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
          <StatusBar style='light' backgroundColor='transparent' translucent/>
          <Routes />

          <Toast config={toastConfig} />
        </ThemeProvider>
      </View>
    </GestureHandlerRootView>
  );
}
