import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar,
  Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { AuthService } from '../../services/authService';
import { theme } from '../../config/theme';
import { showToast } from '../../utils/toast';

export const SignIn = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast.info("Campos Vazios", "Por favor, preencha seu e-mail e senha.")
      return;
    }

    setLoading(true);
    const { error } = await AuthService.signIn({ email, password });
    setLoading(false);

    if (error) {
      showToast.error('Acesso Negado', 'E-mail ou senha incorretos.')
    } else {
      showToast.success('Bem-vindo de volta!', 'Preparando o painel...')
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <Image source={require('../../../assets/logo.png')} style={styles.logoCircle} resizeMode='contain' />
        <Text style={styles.title}>MotoWave</Text>
        <Text style={styles.subtitle}>Seu diário de bordo inteligente</Text>
      </View>

      <View style={styles.form}>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="email-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Seu e-mail"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Sua senha"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry={!visible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setVisible(!visible)} style={{ paddingRight: 15 }}>
            <MaterialCommunityIcons
              name={visible ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
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
            Ainda não tem conta? <Text style={styles.registerHighlight}>Crie Agora</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: theme.fonts.title,
    color: theme.colors.text,
    letterSpacing: 2,
    textTransform: 'uppercase'
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 55,
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    height: '100%',
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 5,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: theme.fonts.title,
    letterSpacing: 1,
  },
  registerLink: {
    marginTop: 25,
    alignItems: 'center',
  },
  registerText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  registerHighlight: {
    color: theme.colors.primary,
    fontWeight: 'bold'
  }
});