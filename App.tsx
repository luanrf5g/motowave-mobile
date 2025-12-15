import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { TabRoutes } from './src/routes/TabRoutes';

export default function App() {
  return (
    <NavigationContainer>
      <TabRoutes/>
    </NavigationContainer>
  );
}
