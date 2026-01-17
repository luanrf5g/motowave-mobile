import { Platform, View } from 'react-native';
import { Routes } from './src/routes';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen'
import { ThemeProvider } from 'react-native-rapi-ui'
import * as NavigationBar from 'expo-navigation-bar'
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui'

import {
  useFonts,
  Orbitron_400Regular,
  Orbitron_500Medium,
  Orbitron_700Bold
} from '@expo-google-fonts/orbitron'
import { useCallback, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/config/toastConfig';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
    <View style={{flex: 1, backgroundColor: '#121212'}} onLayout={onLayoutRootView}>
      <ThemeProvider theme='dark'>
        <StatusBar style='light' backgroundColor='transparent' translucent/>
        <Routes />

        <Toast config={toastConfig} />
      </ThemeProvider>
    </View>
  );
}
