import { useNavigation } from "@react-navigation/native"
import { useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native"
import { Button, Layout, Text, TextInput, themeColor, useTheme } from "react-native-rapi-ui"
import { supabase } from "../../lib/supabase"
import { StatusBar } from "expo-status-bar"

export const SignIn = () => {
  const { isDarkmode } = useTheme()
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if(!email || !password) {
      Alert.alert('Error', 'Por favor preencha todos os dados!');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    setLoading(false);

    if(error) {
      Alert.alert('Error ao entrar', error.message)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Layout>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 20
          }}
        >
          <View style={{alignItems: 'center', marginBottom: 30}}>
            <Text size="h1">Bem-vindo de volta!</Text>
            <Text size="lg" style={{ marginTop: 10, opacity: 0.5 }}>
              Continue sua jornada no MotoWave.
            </Text>
          </View>

          <View style={{ gap: 15 }}>
            <Text fontWeight="bold" size="md">E-mail:</Text>
            <TextInput
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <Text fontWeight="bold" size="md">Senha:</Text>
            <TextInput
              placeholder="Sua senha segura"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              secureTextEntry
            />

            <Button
              text={loading ? "Entrando..." : "Entrar"}
              onPress={handleLogin}
              style={{marginTop: 10}}
              disabled={loading}
              status="primary"
            />

            <View style={{alignItems: 'center', marginTop: 10}}>
              <Text
                size="md"
                style={{opacity: 0.5}}
                onPress={() => Alert.alert('Em breve', 'Funcionalidade de Recuperação será adicionada!')}
              >
                Esqueceu a senha?
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 30,
            }}
          >
            <Text size="md">Não tem uma conta? </Text>
            <Text
              size="md"
              fontWeight="bold"
              style={{color: isDarkmode ? themeColor.white100 : themeColor.primary}}
              onPress={() => navigation.navigate('SignUp')}
            >
              Cadastre-se
            </Text>
          </View>
        </ScrollView>
      </Layout>
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  )
}