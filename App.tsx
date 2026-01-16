import { View } from 'react-native';
import { Routes } from './src/routes';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen'
import { ThemeProvider } from 'react-native-rapi-ui'

import {
  useFonts,
  Orbitron_400Regular,
  Orbitron_500Medium,
  Orbitron_700Bold
} from '@expo-google-fonts/orbitron'
import { useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/config/toastConfig';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Orbitron_400Regular,
    Orbitron_500Medium,
    Orbitron_700Bold
  })

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
        <StatusBar style='light' backgroundColor='#121212'/>
        <Routes />

        <Toast config={toastConfig} />
      </ThemeProvider>
    </View>
  );
}
