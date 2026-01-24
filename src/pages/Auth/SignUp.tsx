import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { theme } from '@/config/theme';
import { showToast } from '@/utils/toast';

import { AuthService } from '@/services/authService';

export const SignUp = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !username) {
      showToast.info('Campos Vazios', 'preencha todos os campos para continuar.')
      return;
    }

    setLoading(true);
    const { user, error } = await AuthService.signUp({ email, password, username });
    setLoading(false);

    if (error) {
      showToast.error('Acesso Negado', 'Erro ao tentar se cadastrar.')
      return;
    }

    if (user) {
      showToast.success('Bem-vindo!', 'Conta criada com sucesso. Faça login para começar.')
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Entre para o clube MotoWave</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="account-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nome de usuário (Apelido)"
            placeholderTextColor={theme.colors.textMuted}
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="email-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Seu melhor e-mail"
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
            placeholder="Crie uma senha forte"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry={!visible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setVisible(!visible)} style={{ paddingRight: 15 }}>
            <MaterialCommunityIcons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleSignUp}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.primary} />
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
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  header: { marginBottom: 40 },
  title: {
    fontSize: 32,
    fontFamily: theme.fonts.title,
    color: theme.colors.text,
    letterSpacing: 1
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.primary,
    marginTop: 5
  },

  form: { width: '100%' },
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
  inputIcon: { marginLeft: 15, marginRight: 10 },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    height: '100%',
  },

  registerButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 3
  },
  registerButtonText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontFamily: theme.fonts.title
  },

  backButton: { marginTop: 20, alignItems: 'center' },
  backButtonText: {
    color: theme.colors.textMuted,
    fontSize: 16,
  }
});