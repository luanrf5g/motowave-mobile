import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

interface CustomHeaderProps {
  showNotification?: boolean;
}

export const CustomHeader = ({ showNotification = true }: CustomHeaderProps) => {
  const navigation = useNavigation<any>();
  const [currentCity, setCurrentCity] = useState("Localizando...");
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Lógica Autônoma de Localização
  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      try {
        // Verifica permissão (sem pedir de novo se já tiver)
        const { status } = await Location.getForegroundPermissionsAsync();

        if (status !== 'granted') {
          if(isMounted) setCurrentCity("MotoWave");
          return;
        }

        // Tenta pegar a última posição conhecida (Rápido)
        let location = await Location.getLastKnownPositionAsync({});

        // Se não tiver última, pega a atual (Mais lento, mas preciso)
        if (!location) {
          location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        }

        if (location && isMounted) {
          const address = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });

          if (address.length > 0) {
            const city = address[0].city || address[0].subregion || address[0].district;
            const state = address[0].region; // Sigla do estado (ex: MG)

            // Formatação bonita: "Viçosa - MG" ou só a cidade
            if(isMounted) setCurrentCity(state ? `${city} - ${state}` : city || "Desconhecido");
          }
        }
      } catch (e) {
        console.log("Erro no Header GPS:", e);
        if(isMounted) setCurrentCity("Sem GPS");
      }
    };

    getLocation();

    return () => { isMounted = false };
  }, []);

  return (
    <View style={styles.container}>
      {/* StatusBar Dark */}
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <View style={styles.statusBar} />

      <View style={styles.content}>
        {/* LADO ESQUERDO: Avatar Pequeno */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => navigation.navigate('Passport')}
        >
          <View style={styles.avatarPlaceholder}>
             <MaterialCommunityIcons name="account" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* CENTRO: Localização Atual */}
        <View style={styles.centerContainer}>
          <View style={styles.locationBadge}>
            <MaterialCommunityIcons name="map-marker" size={14} color="#27AE60" style={{marginRight: 4}} />
            <Text style={styles.locationText} numberOfLines={1}>
              {currentCity}
            </Text>
          </View>
        </View>

        {/* LADO DIREITO: Notificação / Config */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => console.log("Abrir Notificações")}
        >
          {showNotification && (
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          )}
          {/* Bolinha de "novo" */}
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
    backgroundColor: '#121212', // Fundo Dark
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E', // Separação sutil
    zIndex: 100,
  },
  statusBar: {
    height: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight,
    backgroundColor: '#121212'
  },
  content: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  // Avatar Estilo Instagram (Pequeno)
  avatarContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1E1E1E'
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Centro (Pílula de Localização)
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E', // Pílula cinza
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A'
  },
  locationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ddd',
    maxWidth: 150, // Evita quebrar layout se cidade for grande
  },

  // Ícone Direita
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C0392B', // Vermelho notificação
    borderWidth: 1,
    borderColor: '#121212'
  }
});