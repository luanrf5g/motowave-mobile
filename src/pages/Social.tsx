import { useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native"
import { supabase } from "../lib/supabase";

export const Social = () => {
  const [status, setStatus] = useState('');

  async function readStatus() {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);

    if(error) {
      console.error(error.message);
      setStatus('Erro na conexão: ' + error.message);
    } else {
      setStatus('Conexão com o Banco: OK! (dados recebidos)')
    }
  }

  async function createUser() {
    const emailTest = `motoqueiro_${Math.floor(Math.random() * 1000)}@teste.com`;

    const {data, error} = await supabase.auth.signUp({
      email: emailTest,
      password: 'senha123456',
      options: {
        data: {
          username: `Motoqueiro_${Math.floor(Math.random() * 1000)}`,
        }
      }
    })

    if(error) {
      Alert.alert('Erro na criação do usuário: ' + error.message);
    } else {
      Alert.alert('Sucesso', 'Verifique seu email (se a confirmação estiver ativa no Supabase) para completar o cadastro.');
      console.log(data);
    }
  }

  return (
    <View style={{padding: 50, gap: 20}}>
      <Text>Status: {status}</Text>
      <Button title="Testar conexão (Leitura)" onPress={readStatus} />
      <Button title="Criar Usuário de Teste" onPress={createUser} />
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  }
})