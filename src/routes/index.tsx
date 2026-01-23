import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { TabRoutes } from "./TabRoutes";
import { Cities } from '../pages/Cities';
import { supabase } from '../lib/supabase';
import { SignUp } from '../pages/Auth/SignUp';
import { SignIn } from '../pages/Auth/SignIn';
import { TripDetails } from '../pages/TripDetails';
import { Settings } from '@/pages/Settings';
import { ContactScreen } from '@/pages/ContacScreen';

type RootStackParamList = {
  SignIn: undefined,
  SignUp: undefined,
  TabRoutes: undefined,
  TripDetails: {
    tripId: string
  },
  Cities: undefined,
  Settings: undefined,
  Contact: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export function Routes() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false)
    });

    const { data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe();
  }, [])

  if(isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'}}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {session
         ? (
          <Stack.Group>
            <Stack.Screen name="TabRoutes" component={TabRoutes}/>
            <Stack.Screen name="TripDetails" component={TripDetails} />
            <Stack.Screen name="Cities" component={Cities}/>
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Contact" component={ContactScreen} />
          </Stack.Group>
        )
        : (
          <Stack.Group>
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="SignUp" component={SignUp} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}