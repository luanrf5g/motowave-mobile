import { StatusBar } from 'expo-status-bar';
import { Routes } from './src/routes';
import { ThemeProvider } from 'react-native-rapi-ui'
import { View } from 'react-native';

export default function App() {
  return (
    <ThemeProvider>
      <StatusBar style='light' />
      <View style={{flex: 1, backgroundColor: '#121212'}}>
        <Routes />
      </View>
    </ThemeProvider>
  );
}
