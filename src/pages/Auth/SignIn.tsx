import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase'; // Ajuste o caminho
import { useNavigation } from '@react-navigation/native';

export const SignIn = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Falha no Login', error.message);
    }
    // O AuthStateListener no App.tsx deve redirecionar automaticamente
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* HEADER / LOGO */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <MaterialCommunityIcons name="bike-fast" size={50} color="#27AE60" />
        </View>
        <Text style={styles.title}>MotoWave</Text>
        <Text style={styles.subtitle}>Seu diário de bordo inteligente</Text>
      </View>

      {/* FORMULÁRIO */}
      <View style={styles.form}>

        {/* Input Email */}
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="email-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Seu e-mail"
            placeholderTextColor="#666"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Input Senha */}
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Sua senha"
            placeholderTextColor="#666"
            secureTextEntry={!visible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setVisible(!visible)} style={{ paddingRight: 15 }}>
            <MaterialCommunityIcons name={visible ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>ACELERAR</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.registerText}>
            Ainda não tem conta? <Text style={styles.registerHighlight}>Crie agora</Text>
          </Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#27AE60',
    // Glow effect
    elevation: 10,
    shadowColor: '#27AE60',
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  form: {
    width: '100%',
  },
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
  inputIcon: {
    marginLeft: 15,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
  },
  loginButton: {
    backgroundColor: '#27AE60',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 5,
    shadowColor: '#27AE60',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  registerLink: {
    marginTop: 25,
    alignItems: 'center',
  },
  registerText: {
    color: '#888',
    fontSize: 14,
  },
  registerHighlight: {
    color: '#27AE60',
    fontWeight: 'bold',
  }
});