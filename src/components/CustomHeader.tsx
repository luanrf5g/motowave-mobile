import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface CustomHeaderProps {
  title?: string;
  subtitle?: string;
  showNotification?: boolean;
}

export const CustomHeader = ({ title, subtitle, showNotification = true }: CustomHeaderProps) => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      {/* Área Segura do Topo (Status Bar) */}
      <View style={styles.statusBar} />

      <View style={styles.content}>
        {/* LADO ESQUERDO: Avatar */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => navigation.navigate('Passport')} // Ou 'Profile' se criar separado
        >
          <View style={styles.avatarPlaceholder}>
             <MaterialCommunityIcons name="account" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* CENTRO: Título/Localização */}
        <View style={styles.centerContainer}>
          <Text style={styles.title}>{title || "MotoWave"}</Text>
          {subtitle && (
            <View style={styles.subtitleContainer}>
              <MaterialCommunityIcons name="map-marker" size={12} color="#27AE60" />
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          )}
        </View>

        {/* LADO DIREITO: Notificação */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => console.log("Abrir Notificações")}
        >
          {showNotification && (
            <MaterialCommunityIcons name="bell-outline" size={26} color="#333" />
          )}
          {/* Bolinha vermelha de "nova notificação" (fake por enquanto) */}
          {showNotification && (
            <View style={styles.badge} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    zIndex: 100,
    paddingTop: 10,
  },
  statusBar: {
    height: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight, // Espaço da barra de status
    backgroundColor: '#fff'
  },
  content: {
    height: 60, // Altura do Header
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2C3E50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C0392B',
    borderWidth: 1,
    borderColor: '#fff'
  }
});