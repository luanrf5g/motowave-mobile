import { useNavigation } from "@react-navigation/native";
import { StatusBar } from 'expo-status-bar'
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native"
import { Layout, useTheme, Text, TextInput, Button, themeColor } from "react-native-rapi-ui"
import { supabase } from "../../lib/supabase";

export const SignUp = () => {
  const { isDarkmode } = useTheme()
  const navigation = useNavigation<any>();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if(!username || !email || !password) {
      Alert.alert('Error', 'Por favor preencha todos os dados!');
      return;
    }

    setLoading(true);


    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    })

    setLoading(false);

    if(error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('Success', 'Conta criada com sucesso! Verifique seu email para confirmar sua conta.');
      // navigation.navigate('SignIn');
    }
  }

  return(
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1}}
    >
      <Layout>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 20
          }}
        >
          <View style={{  alignItems: 'center', marginBottom: 30  }}>
            <Text size="h1" fontWeight="bold" >MotoWave</Text>
            <Text size="lg" style={{marginTop: 10, opacity: 0.5}}>
              Crie seu passaporte de viagens
            </Text>
          </View>

          <View style={{  gap: 15  }}>
            <Text fontWeight="medium" size="md">Nome do Piloto (username):</Text>
            <TextInput
              placeholder="Ex: Viajante Solitário"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <Text fontWeight="medium" size="md">E-mail:</Text>
            <TextInput
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text fontWeight="medium" size="md">Senha:</Text>
            <TextInput
              placeholder="Digite sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              text={loading ? "Criando conta..." : "Criar Conta"}
              onPress={handleSignUp}
              style={{marginTop: 10}}
              disabled={loading}
              status="primary"
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 30,
            }}
          >
            <Text size="md">Já tem uma conta?</Text>
            <Text
              size="md"
              fontWeight="bold"
              style={{color: isDarkmode ? themeColor.white100 : themeColor.primary, marginLeft: 5 }}
              onPress={() => navigation.navigate('SignIn')}
            >
              Fazer Login
            </Text>
          </View>
        </ScrollView>
      </Layout>
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  )
}