import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View, Platform, ToastAndroid } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import haversine from 'haversine';

// --- CONFIGURAÇÕES E TIPOS ---
const STORAGE_KEYS = {
  ROUTE: '@motowave:route',
  DISTANCE: '@motowave:distance',
  CITIES: '@motowave:cities',
  HISTORY: '@motowave:history',
  GLOBAL_STATS: '@motowave:global_stats',
};

interface GlobalStats {
  totalKm: number;
  allCities: Cities[];
}

interface Cities {
  name: string,
  latitude: number,
  longitude: number
}

interface Trip {
  id: string;
  date: string;
  distance: number;
  cities: Cities[];
  route: Location.LocationObjectCoords[];
}

// --- ESTADO GLOBAL FORA DO CICLO DE RENDER (Para precisão do GPS) ---
let tripSession = {
  route: [] as Location.LocationObjectCoords[],
  distance: 0,
  cities: [] as Cities[],
  lastCityCheckDist: 0,
};

export const Home = () => {
  // Estados de Interface
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [distanceDisplay, setDistanceDisplay] = useState(0);
  const [routeDisplay, setRouteDisplay] = useState<Location.LocationObjectCoords[]>([]);
  const [citiesCount, setCitiesCount] = useState(0);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // --- PERSISTÊNCIA ---
  const saveCurrentSession = async () => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ROUTE, JSON.stringify(tripSession.route)],
        [STORAGE_KEYS.DISTANCE, tripSession.distance.toString()],
        [STORAGE_KEYS.CITIES, JSON.stringify(tripSession.cities)],
      ]);
    } catch (e) {
      console.error('Erro ao salvar sessão temporária', e);
    }
  };

  // --- LÓGICA DE GEOLOCALIZAÇÃO ---
  const checkCurrentCity = async (coords: Location.LocationObjectCoords) => {
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (address.length > 0) {
        const city = address[0].city || address[0].subregion;
        const normalizedCity = city?.trim().toUpperCase();

        if (city && normalizedCity && !tripSession.cities.map(c => c.name.toUpperCase()).includes(normalizedCity)) {
          tripSession.cities.push({
            name: city,
            latitude: coords.latitude,
            longitude: coords.longitude,
          }); // Mantém o nome original para exibição
          setCitiesCount(tripSession.cities.length);
          if (Platform.OS === 'android') ToastAndroid.show(`📍 ${city}`, ToastAndroid.SHORT);
          await saveCurrentSession();
        }
      }
    } catch (e) {
      console.log('Erro ao buscar cidade', e);
    }
  };

  const updateLocation = (newLocation: Location.LocationObject) => {
    const newPoint = newLocation.coords;

    if (tripSession.route.length > 0) {
      const lastPoint = tripSession.route[tripSession.route.length - 1];
      const dist = haversine(lastPoint, newPoint, { unit: 'km' }) || 0;

      if (dist > 0.005) { // Movimento > 5 metros
        tripSession.distance += dist;
        tripSession.route.push(newPoint);

        // Checagem de cidade a cada 2km ou se for a primeira
        if ((tripSession.distance - tripSession.lastCityCheckDist > 2) || tripSession.cities.length === 0) {
          checkCurrentCity(newPoint);
          tripSession.lastCityCheckDist = tripSession.distance;
        }
      }
    } else {
      tripSession.route.push(newPoint);
      checkCurrentCity(newPoint);
    }

    // Atualiza a UI
    setLocation(newLocation);
    setDistanceDisplay(tripSession.distance);
    setRouteDisplay([...tripSession.route]);
    saveCurrentSession();
  };

  // --- CICLO DE VIDA ---
  useEffect(() => {
    const initApp = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'O MotoWave precisa do GPS para funcionar.');
        return;
      }

      // Restaurar sessão anterior
      const savedData = await AsyncStorage.multiGet([
        STORAGE_KEYS.ROUTE,
        STORAGE_KEYS.DISTANCE,
        STORAGE_KEYS.CITIES,
      ]);

      if (savedData[0][1]) {
        tripSession.route = JSON.parse(savedData[0][1]);
        setRouteDisplay(tripSession.route);
      }
      if (savedData[1][1]) {
        tripSession.distance = parseFloat(savedData[1][1]);
        setDistanceDisplay(tripSession.distance);
        tripSession.lastCityCheckDist = tripSession.distance;
      }
      if (savedData[2][1]) {
        tripSession.cities = JSON.parse(savedData[2][1]);
        setCitiesCount(tripSession.cities.length);
      }

      const current = await Location.getCurrentPositionAsync({});
      setLocation(current);
    };

    initApp();
    return () => locationSubscription.current?.remove();
  }, []);

  // --- AÇÕES DO USUÁRIO ---
  const toggleTracking = async () => {
    if(locationSubscription.current) {
      console.log("PARANDO RASTREAMENTO FOREGROUND...");

      locationSubscription.current.remove()
      locationSubscription.current = null
      setIsTracking(false)
    } else {
      console.log("INICIANDO RASTREAMENTO FOREGROUND...")

      try {
        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 2000,
            distanceInterval: 10,
          },
          updateLocation
        );
        locationSubscription.current = sub;
        setIsTracking(true);
      } catch (e) {
        Alert.alert('Erro de rastreamento', 'verifique se as permissões estão ativas.')
      }
    }
  };

  const handleFinishTrip = () => {
    Alert.alert("Finalizar Viagem", "Deseja salvar no diário de bordo?", [
      { text: "Cancelar", style: 'cancel' },
      { text: "Salvar e Finalizar", onPress: saveTripToHistory },
      { text: "Apenas Apagar", style: 'destructive', onPress: resetCurrentTrip }
    ]);
  };

  const resetCurrentTrip = async () => {
    tripSession = { route: [], distance: 0, cities: [], lastCityCheckDist: 0 };
    setRouteDisplay([]);
    setDistanceDisplay(0);
    setCitiesCount(0);
    await AsyncStorage.multiRemove([STORAGE_KEYS.ROUTE, STORAGE_KEYS.DISTANCE, STORAGE_KEYS.CITIES]);
  };

  const saveTripToHistory = async () => {
    if (tripSession.distance < 0.1) {
      Alert.alert("Viagem muito curta", "Não há dados suficientes para salvar.");
      return;
    }

    try {
      // 1. Atualizar Estatísticas Globais (Passaporte)
      const globalStatsJson = await AsyncStorage.getItem(STORAGE_KEYS.GLOBAL_STATS);
      const globalStats: GlobalStats = globalStatsJson
        ? JSON.parse(globalStatsJson)
        : { totalKm: 0, allCities: [] };

      // Combine all Cities objects, remove duplicates by name (case-insensitive)
      const combinedCities = [
        ...globalStats.allCities,
        ...tripSession.cities
      ];
      const uniqueCitiesMap = new Map<string, Cities>();
      combinedCities.forEach(city => {
        const key = city.name.trim().toUpperCase();
        if (!uniqueCitiesMap.has(key)) {
          uniqueCitiesMap.set(key, city);
        }
      });

      const updatedStats: GlobalStats = {
        totalKm: globalStats.totalKm + tripSession.distance,
        allCities: Array.from(uniqueCitiesMap.values())
      };
      await AsyncStorage.setItem(STORAGE_KEYS.GLOBAL_STATS, JSON.stringify(updatedStats));

      // 2. Salvar no Histórico
      const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      const history: Trip[] = historyJson ? JSON.parse(historyJson) : [];

      const newTrip: Trip = {
        id: new Date().toISOString(),
        date: new Date().toISOString(),
        distance: tripSession.distance,
        cities: [...tripSession.cities],
        route: [...tripSession.route]
      };

      history.push(newTrip);
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

      // 3. Limpar
      await resetCurrentTrip();
      Alert.alert("Sucesso!", "Aventura gravada!");
    } catch (e) {
      Alert.alert("Erro", "Falha ao salvar dados.");
    }
  };

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }}
          showsUserLocation
          followsUserLocation
        >
          <Polyline coordinates={routeDisplay} strokeColor='#27AE60' strokeWidth={6} />
        </MapView>
      ) : (
        <View style={styles.loading}><Text>Localizando Moto...</Text></View>
      )}

      {/* HUD SUPERIOR - Design Cinza Escuro */}
      <View style={styles.hudContainer}>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>DISTÂNCIA</Text>
          <Text style={styles.hudValue}>{distanceDisplay.toFixed(1)} <Text style={{fontSize: 12}}>km</Text></Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>CIDADES</Text>
          <Text style={styles.hudValue}>{citiesCount}</Text>
        </View>
      </View>

      {/* CONTROLES INFERIORES */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.mainButton, isTracking ? styles.stopBtn : styles.startBtn]}
          onPress={toggleTracking}
        >
          <Text style={styles.btnText}>{isTracking ? 'PAUSAR' : 'ACELERAR'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleFinishTrip}>
          <MaterialCommunityIcons name="flag-checkered" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' },

  hudContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: '#2C3E50', // Cinza Azulado Escuro
    borderRadius: 20,
    paddingVertical: 15,
    width: '85%',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  hudItem: { alignItems: 'center' },
  divider: { width: 1, height: '70%', backgroundColor: '#455A64' },
  hudLabel: { fontSize: 10, color: '#BDC3C7', fontWeight: 'bold', letterSpacing: 1 },
  hudValue: { fontSize: 26, fontWeight: 'bold', color: '#FFF' },

  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mainButton: {
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 35,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startBtn: { backgroundColor: '#1E8449' }, // Verde Escuro
  stopBtn: { backgroundColor: '#C0392B' },  // Vermelho Sóbrio
  saveBtn: {
    backgroundColor: '#2C3E50',
    padding: 18,
    borderRadius: 35,
    marginLeft: 15,
    elevation: 8,
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
});