import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { darkMapStyle } from '../styles/mapStyle'; // Seu estilo dark
import { CustomHeader } from '../components/CustomHeader'; // Seu header padrão

interface CityMarker {
  city_name: string;
  state: string,
  lat: number;
  lon: number;
}

export const Cities = () => {
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  const [cities, setCities] = useState<CityMarker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Chamada da RPC simplificada
        const { data, error } = await supabase
          .rpc('get_user_visited_cities', { target_user_id: user.id });

        if (error) throw error;

        if (data) {
          setCities(data);

          // Efeito de zoom automático para mostrar todos os marcadores
          if (data.length > 0 && mapRef.current) {
            setTimeout(() => {
              const coords = data.map((c: any) => ({
                latitude: c.lat,
                longitude: c.lon
              }));

              mapRef.current?.fitToCoordinates(coords, {
                edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
                animated: true
              });
            }, 500);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar cidades:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#27AE60" />
        </View>
      ) : (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          customMapStyle={darkMapStyle}
          initialRegion={{
            latitude: -14.2350, // Centro do Brasil (fallback)
            longitude: -51.9253,
            latitudeDelta: 20,
            longitudeDelta: 20,
          }}
        >
          {cities.map((city, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: city.lat, longitude: city.lon }}
              title={`${city.city_name} - ${city.state}`}
            >
              {/* Marcador Customizado */}
              <View style={styles.markerContainer}>
                <MaterialCommunityIcons name="map-marker-star" size={32} color="#27ae60" />
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      {/* Botão Flutuante de Voltar (Opcional se já tiver header com back) */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#333'
  }
});