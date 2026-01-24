import { Platform, StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Home } from "@/pages/Home";
import { History } from "@/pages/History";
import { Passport } from "@/pages/Passport";

const Tab = createBottomTabNavigator();

export const TabRoutes = () => {
  return (
    <Tab.Navigator
      initialRouteName="Map"
      screenOptions={{
        headerShown: false, // Oculta o header padrão (pois já temos o CustomHeader)
        tabBarShowLabel: false,

        // ESTILIZAÇÃO DARK
        tabBarStyle: {
          backgroundColor: '#121212', // Fundo Dark
          borderTopColor: '#1E1E1E',  // Borda sutil no topo
          borderTopWidth: 1,
          paddingTop: 20,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Ajuste para iPhone X+
          height: Platform.OS === 'ios' ? 88 : 70, // Altura confortável
          elevation: 0, // Remove sombra padrão feia do Android
        },
      }}
    >
      <Tab.Screen
        name="Map"
        component={Home}
        options={{
          headerShown: false,
          title: 'Viagem',
          tabBarIcon: ({focused, color, size}) => (
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={size}
              color={focused ? '#27AE60' : '#555'}
            />
          )
        }}
      />

      <Tab.Screen
        name="Passport"
        component={Passport}
        options={{
          title: 'Comunidade',
          tabBarIcon: ({focused, color, size}) => (
            <MaterialCommunityIcons
              name="passport"
              size={size}
              color={focused ? '#27AE60' : '#555'}
            />
          )
        }}
      />

      <Tab.Screen
        name="History"
        component={History}
        options={{
          title: 'Histórico',
          tabBarIcon: ({focused, color, size}) => (
            <MaterialCommunityIcons
              name="notebook"
              size={size}
              color={focused ? '#27AE60' : '#555'}
            />
          )
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'transparent'
  },
  iconContainerActive: {
    backgroundColor: 'rgba(39, 174, 96, 0.15)',
    borderBottomWidth: 3,
    borderBottomColor: '#27AE60',
    transform: [{ scale: 1.1 }]
  }
})