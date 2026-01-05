import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';

export const SignUp = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false)

  const handleSignUp = async () => {
    if (!email || !password) return Alert.alert("Erro", "Preencha tudo");

    setLoading(true);
    // Cria o usuário
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });

    if (error) {
      setLoading(false);
      Alert.alert("Erro ao cadastrar", error.message);
      return;
    }

    if (user) {
      Alert.alert("Sucesso", "Conta criada! Verifique seu e-mail ou faça login.");
      navigation.goBack(); // Volta pro Login
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Entre para o clube MotoWave</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="account-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nome de usuário"
            placeholderTextColor="#666"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="email-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Seu melhor e-mail"
            placeholderTextColor="#666"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Crie uma senha forte"
            placeholderTextColor="#666"
            secureTextEntry={!visible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setVisible(!visible)} style={{ paddingRight: 15 }}>
            <MaterialCommunityIcons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>CADASTRAR</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Já tenho conta</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    padding: 20,
  },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#27AE60', marginTop: 5 },

  form: { width: '100%' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    height: 55,
  },
  inputIcon: { marginLeft: 15, marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 16, height: '100%' },

  registerButton: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#27AE60',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: { color: '#27AE60', fontSize: 18, fontWeight: 'bold' },

  backButton: { marginTop: 20, alignItems: 'center' },
  backButtonText: { color: '#888' }
});