import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import { theme } from "@/config/theme"

import { useProfileSettings } from "@/hooks/useProfileSettings"

const AVATAR_OPTIONS = [
  'motorbike', 'moped', 'racing-helmet', 'engine', 'speedometer', 'road-variant', 'tire',
  'compass', 'map-marker-distance', 'tent', 'flag-checkered', 'telescope',
  'alien', 'alien-outline', 'ufo', 'rocket-launch',
  'robot', 'robot-happy', 'robot-dead', 'face-man-profile', 'head-snowflake', 'ghost'
]

export const Settings = () => {
  const {
    profile, loading, saving, updateField, handleSave, handleLogout, handleBirthdayChange, navigation
  } = useProfileSettings()

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CONFIGURAÇÕES</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>IDENTIDADE VISUAL</Text>
        <View style={styles.avatarSection}>
          <View style={styles.currentAvatarRing}>
            <MaterialCommunityIcons
              name={profile.avatar_slug as any}
              size={50}
              color={theme.colors.primary}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarList}>
            {AVATAR_OPTIONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.avatarOption,
                  profile.avatar_slug === icon && styles.avatarSelected
                ]}
                onPress={() => updateField('avatar_slug', icon)}
              >
                <MaterialCommunityIcons
                  name={icon as any}
                  size={24}
                  color={profile.avatar_slug === icon ? theme.colors.background : '#666'}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>APELIDO (PILOTO)</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="account" size={20} color='#666' style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              value={profile.username}
              onChangeText={(t) => updateField('username', t)}
              placeholderTextColor='#444'
              placeholder="Como quer ser chamado"
            />
          </View>

          <Text style={styles.label}>BIO (FRASE DO PERFIL)</Text>
          <View style={[styles.inputContainer, { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
            <TextInput
              style={[styles.input, { height: '100%'}]}
              value={profile.bio}
              onChangeText={(t) => updateField('bio', t)}
              placeholderTextColor='#444'
              placeholder="Ex: Rodando o mundo Ténéré..."
              multiline
              maxLength={120}
            />
          </View>

          <Text style={styles.label}>DATA DE ANIVERSÁRIO</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="cake-variant" size={20} color="#666" style={{marginRight: 10}} />
            <TextInput
              style={styles.input}
              value={profile.birthday}
              onChangeText={handleBirthdayChange}
              placeholderTextColor="#444"
              placeholder="DD/MM/AAAA"
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.readOnlyContainer}>
          <Text style={styles.readOnlyLabel}>CONTA VINCULADA</Text>
          <Text style={styles.readOnlyValue}>{profile.email}</Text>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#000" />
          ): (
            <Text style={styles.saveButtonText}>SALVAR ALTERAÇÕES</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name='logout' size={20} color={theme.colors.danger} />
          <Text style={styles.logoutText}>DESCONTECTAR</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          MotoWave v1.0.0 • KytSoftwares
        </Text>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.surface,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#222'
  },
  headerTitle: {
    color: '#fff',
    fontFamily: theme.fonts.title,
    fontSize: 16,
    letterSpacing: 1
  },
  backButton: {
    padding: 5
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 50
  },

  // Avatar
  sectionLabel: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    marginBottom: 15,
    letterSpacing: 1
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  currentAvatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    marginRight: 15,
    elevation: 10,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 10
  },
  avatarList: {
    flexGrow: 0,
  },
  avatarOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333'
  },
  avatarSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: '#fff'
  },

  // Form
  formGroup: {
    marginBottom: 20
  },
  label: {
    color: '#888',
    fontSize: 10,
    fontFamily: theme.fonts.bold,
    marginBottom: 8,
    marginTop: 15,
    marginLeft: 4
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#333'
  },
  input: {
    flex: 1,
    color: '#fff',
    fontFamily: theme.fonts.body,
    fontSize: 14
  },

  // Read Only
  readOnlyContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'center'
  },
  readOnlyLabel: {
    color: '#555',
    fontSize: 10,
    fontFamily: theme.fonts.bold,
    marginBottom: 4
  },
  readOnlyValue: {
    color: '#777',
    fontFamily: theme.fonts.body,
    fontSize: 14
  },

  // Actions
  saveButton: {
    backgroundColor: theme.colors.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3
  },
  saveButtonText: {
    color: '#000',
    fontFamily: theme.fonts.bold,
    fontSize: 16
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: 12
  },
  logoutText: {
    color: theme.colors.danger,
    fontFamily: theme.fonts.bold,
    marginLeft: 10
  },
  footerText: {
    textAlign: 'center',
    color: '#444',
    fontSize: 10,
    marginTop: 30,
    fontFamily: theme.fonts.body
  }
});