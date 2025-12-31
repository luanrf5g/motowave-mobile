import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../lib/supabase';

// --- TIPAGEM ---
interface City {
  city_name: string;
  location: string; // Vem como "POINT(-46 -23)"
}

interface TripFullDetail {
  id: string;
  title: string;
  total_distance: number;
  created_at: string;
  route_coords: { latitude: number; longitude: number }[];
  cities: { name: string; latitude: number; longitude: number }[];
}

interface TripReturnProps {
  id: string,
  title: string,
  total_distance: number,
  created_at: string,
  route_wkt: string,
  cities_data: {
    name: string,
    location_wkt: string,
  }[]
}

// --- PARSERS WKT (PostGIS -> React Native) ---

// Converte "LINESTRING(-46 -23, -47 -24)" para Array de coords
const parseLineString = (wkt: string) => {
  if (!wkt) return [];
  const content = wkt.replace('LINESTRING(', '').replace(')', '');
  const points = content.split(',');

  return points.map(p => {
    const [lon, lat] = p.trim().split(' ');
    return {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
    };
  });
};

// Converte "POINT(-46 -23)" para Objeto coord
const parsePoint = (wkt: string) => {
  if (!wkt) return { latitude: 0, longitude: 0 };
  const content = wkt.replace('POINT(', '').replace(')', '');
  const [lon, lat] = content.trim().split(' ');
  return {
    latitude: parseFloat(lat),
    longitude: parseFloat(lon),
  };
};

export const TripDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { tripId } = route.params as { tripId: string }; // Recebe o ID da tela anterior

  const [trip, setTrip] = useState<TripFullDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    fetchTripDetails();
  }, []);

  const fetchTripDetails = async () => {
    try {
      // Busca JOIN: Viagem + Rota + Cidades
      const { data: rpcData, error } = await supabase
        .rpc('get_trip_details', { target_id: tripId })
        .single();

      if (error) throw error;

      const data = rpcData as TripReturnProps;

      // Processamento dos dados
      const rawRoute = data.route_wkt; // Pega a string LINESTRING
      const rawCities = data.cities_data || [];

      const parsedRoute = rawRoute ? parseLineString(rawRoute) : [];

      const parsedCities = rawCities.map((c: any) => {
        const coords = parsePoint(c.location_wkt);
        return {
          name: c.name,
          latitude: coords.latitude,
          longitude: coords.longitude
        };
      });

      setTrip({
        id: data.id,
        title: data.title || "Viagem sem título",
        total_distance: data.total_distance,
        created_at: data.created_at,
        route_coords: parsedRoute,
        cities: parsedCities
      });

      // Efeito visual: Focar o mapa na rota assim que carregar
      setTimeout(() => {
        if (mapRef.current && parsedRoute.length > 0) {
          mapRef.current.fitToCoordinates(parsedRoute, {
            edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
            animated: true,
          });
        }
      }, 500);

    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível carregar os detalhes.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading || !trip) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27AE60" />
        <Text style={{ marginTop: 10, color: '#fff' }}>Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* MAPA FUNDO */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: trip.route_coords[0]?.latitude || -23.55,
          longitude: trip.route_coords[0]?.longitude || -46.63,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        }}
      >
        {/* A Linha da Rota */}
        <Polyline
          coordinates={trip.route_coords}
          strokeColor="#e74c3c" // Vermelho destaque
          strokeWidth={4}
        />

        {/* Marcador de Início */}
        {trip.route_coords.length > 0 && (
           <Marker coordinate={trip.route_coords[0]} title="Início">
              <MaterialCommunityIcons name="flag" size={30} color="#27AE60" />
           </Marker>
        )}

        {/* Marcadores das Cidades */}
        {trip.cities.map((city, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: city.latitude, longitude: city.longitude }}
            title={city.name}
          >
            <View style={styles.cityMarker}>
               <FontAwesome5 name="city" size={12} color="#fff" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* BOTÃO VOLTAR FLUTUANTE */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>

      {/* CARD DE INFORMAÇÕES (BOTTOM SHEET SIMULADO) */}
      <View style={styles.infoCard}>
        <View style={styles.dragHandle} />

        <Text style={styles.tripTitle}>{trip.title}</Text>
        <Text style={styles.tripDate}>
          {format(new Date(trip.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="map-marker-distance" size={24} color="#27AE60" />
            <Text style={styles.statValue}>{trip.total_distance.toFixed(1)} km</Text>
            <Text style={styles.statLabel}>Total Percorrido</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <FontAwesome5 name="map-marked-alt" size={20} color="#2980b9" />
            <Text style={styles.statValue}>{trip.cities.length}</Text>
            <Text style={styles.statLabel}>Cidades Visitadas</Text>
          </View>
        </View>

        {/* Lista de cidades (Horizontal) se houver espaço */}
        {trip.cities.length > 0 && (
           <View style={{marginTop: 20}}>
              <Text style={styles.sectionHeader}>Roteiro:</Text>
              <Text style={styles.cityList}>
                {trip.cities.map(c => c.name).join(' • ')}
              </Text>
           </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' },

  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    elevation: 5,
    zIndex: 10
  },

  cityMarker: {
    backgroundColor: '#2980b9',
    padding: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff'
  },

  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15
  },
  tripTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333'
  },
  tripDate: {
    fontSize: 14,
    color: '#777',
    marginBottom: 20
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5
  },
  statLabel: {
    fontSize: 12,
    color: '#999'
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#eee'
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 5,
    textTransform: 'uppercase'
  },
  cityList: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20
  }
});