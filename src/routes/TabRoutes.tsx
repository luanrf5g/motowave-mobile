import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Home } from "../pages/Home";
import { Social } from "../pages/Social";
import { Passport } from "../pages/Passport";
import { History } from "../pages/History";

const Tab = createBottomTabNavigator();

export const TabRoutes = () => {
  return (
    <Tab.Navigator
      initialRouteName="Map"
      screenOptions={{
        tabBarActiveTintColor: '#007aff',
        tabBarStyle: {
          backgroundColor: '#f5f5f5',
          borderTopWidth: 0,
        },
        headerShown: false
      }}
    >
      <Tab.Screen
        name="Map"
        component={Home}
        options={{
          headerShown: false,
          title: 'Viagem',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="map-marker-distance" color={color} size={size}/>
          )
        }}
      />

      <Tab.Screen
        name="Passport"
        component={Passport}
        options={{
          title: 'Comunidade',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="trophy" color={color} size={size} />
          )
        }}
      />

      <Tab.Screen
        name="History"
        component={History}
        options={{
          title: 'Histórico',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="book-open-page-variant" color={color} size={size} />
          )
        }}
      />
    </Tab.Navigator>
  )
}