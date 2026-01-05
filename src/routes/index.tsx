import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from "@react-navigation/native";
import { TabRoutes } from "./TabRoutes";
import { SignUp } from '../pages/Auth/SignUp';
import { SignIn } from '../pages/Auth/SignIn';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { ActivityIndicator, View } from 'react-native';
import { TripDetails } from '../pages/TripDetails';

const Stack = createNativeStackNavigator();

export function Routes() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if(error) {
          if(
            error.message.includes('Refresh Token Not Found') ||
            error.message.includes('Invalid Refresh Token')
          ) {
            console.log('Sessão Anterior Expirada. Usuário precisa logar novamente.')

            await supabase.auth.signOut()
            const { data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
              setSession(session)
              setIsLoading(false)
            })

            return () => subscription.unsubscribe();
          }

          console.error('Erro crítico na sessão: ', error.message)
        }

        if (session) {
          await supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoading(false)
          });

          const { data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setIsLoading(false)
          })

          return () => subscription.unsubscribe();
        }
      } catch (e) {
        console.log('Erro genérico no checkSession: ', e)
      }
    }

    checkSession();
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