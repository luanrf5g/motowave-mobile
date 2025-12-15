import { useEffect, useRef, useState } from 'react'
import MapView, { Polyline } from 'react-native-maps'
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as Location from 'expo-location'

import haversine from 'haversine'
import { Trip } from './History'

let globalRoute: Location.LocationObjectCoords[] = []
let globalDistance: number = 0
let globalCities: string[] = []
let lastCityCheckDistance: number = 0;

const ROUTE_KEY = '@motowave:route'
const DISTANCE_KEY = '@motowave:distance'
const CITIES_KEY = '@motowave:cities'
const HISTORY_KEY = '@motowave:history'

const saveDataToStorage = async () => {
  try {
    await AsyncStorage.setItem(ROUTE_KEY, JSON.stringify(globalRoute))
    await AsyncStorage.setItem(DISTANCE_KEY, globalDistance.toString())
    await AsyncStorage.setItem(CITIES_KEY, JSON.stringify(globalCities))
  } catch (e) {
    console.error('Erro ao salvar dados: ', e)
  }
}

export const Home = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [distanceDisplay, setDistanceDisplay] = useState(0)
  const [routeDisplay, setRouteDisplay] = useState<Location.LocationObjectCoords[]>([])
  const [citiesCount, setCitiesCount] = useState(0)

  const locationSubscription = useRef<Location.LocationSubscription | null>(null)

  const checkCurrentCity = async (coords: Location.LocationObjectCoords) => {
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude
      })

      if(address.length > 0) {
        const city = address[0].city || address[0].subregion;

        if(city && !globalCities.includes(city)) {
          // NOVA CIDADE
          globalCities.push(city)
          setCitiesCount(globalCities.length)

          await saveDataToStorage();
        }
      }
    } catch (e) {
      console.log("Erro ao checar cidade (podeser falta de net): ", e)
    }
  }

  const updateLocation = (newLocation: Location.LocationObject) => {
    const newPoint = newLocation.coords;

    if(globalRoute.length > 0) {
      const lastPoint = globalRoute[globalRoute.length - 1];

      const dist = haversine(
        { latitude: lastPoint.latitude, longitude: lastPoint. longitude },
        { latitude: newPoint.latitude, longitude: newPoint.longitude },
        { unit: 'km' }
      ) || 0;

      if (dist > 0.005) {
        globalDistance += dist;
        globalRoute.push(newPoint)


        if((globalDistance - lastCityCheckDistance > 2) || globalCities.length === 0) {
          checkCurrentCity(newPoint)
          lastCityCheckDistance = globalDistance
        }
      }
    } else {
      globalRoute.push(newPoint)
      checkCurrentCity(newPoint)
    }

    setLocation(newLocation)

    setDistanceDisplay(globalDistance)
    setRouteDisplay([...globalRoute])

    saveDataToStorage()
  };

  useEffect(() => {
    const loadSavedData = async () => {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if(foregroundStatus !== 'granted') {
        Alert.alert('Erro de Permissão', 'Autorização de GPS negada.')
        return;
      }

      const savedRoute = await AsyncStorage.getItem(ROUTE_KEY);
      const savedDistance = await AsyncStorage.getItem(DISTANCE_KEY)
      const savedCities = await AsyncStorage.getItem(CITIES_KEY)

      if(savedRoute) {
        try {
          const parsedRoute = JSON.parse(savedRoute) as Location.LocationObjectCoords[]
          globalRoute = parsedRoute
          setRouteDisplay(parsedRoute)
        } catch (e) {
          console.error('Erro ao carregar rota: ', e);
        }
      }

      if(savedDistance) {
        globalDistance = parseFloat(savedDistance)
        setDistanceDisplay(globalDistance)
        lastCityCheckDistance = globalDistance
      }

      if(savedCities) {
        try {
          const parsedCities = JSON.parse(savedCities)
          globalCities = parsedCities;
          setCitiesCount(parsedCities.length)
        } catch (e) {
          console.error("Erro ao carregar cidade: ", e)
        }
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation)
    }

    loadSavedData();

    return () => {
      if(locationSubscription.current) {
        locationSubscription.current.remove();
      }
    }
  }, [])

  const toggleTracking = async () => {
    if(locationSubscription.current) {
      // PARAR
      console.log("PARANDO RASTREAMENTO FOREGROUND...");

      locationSubscription.current.remove();
      locationSubscription.current = null;
      setIsTracking(false);

      await saveDataToStorage();

      Alert.alert(
        "Viagem Pausada",
        `Total percorrido: ${globalDistance.toFixed(2)} km.`
      )
    } else {
      // INICIAR
      console.log("INICIANDO RASTREAMENTO FOREGROUND...")

      try {
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 2000,
            distanceInterval: 10,
          },
          updateLocation
        )

        locationSubscription.current = subscription;
        setIsTracking(true);
      } catch (e) {
        Alert.alert('Erro de rastreamento', `verifique se as permissões estão ativas. Erro: ${e.message}`)
      }
    }
  }

  const resetTrip = async () => {
    Alert.alert("Nova Viagem", "Deseja apagar todo o histórico dessa Viagem e começar do zero?", [
      { text: "Não", style: 'cancel'},
      { text: "Sim, Limpar", style: 'destructive', onPress: async () => {
        globalRoute = [];
        globalDistance = 0;

        setRouteDisplay([])
        setDistanceDisplay(0)

        await AsyncStorage.multiRemove([ROUTE_KEY, DISTANCE_KEY])
        if(locationSubscription.current) {
          locationSubscription.current.remove();
          locationSubscription.current = null
          setIsTracking(false)
        }
      }}
    ])
  }

  const saveTripToHistory = async () => {
    if(globalRoute.length === 0) {
      Alert.alert("Viagem Vazia", "Ande um pouco antes de salvar.")
      return;
    }

    try {
      const existingHistoryJson = await AsyncStorage.getItem(HISTORY_KEY)
      let history: Trip[] = existingHistoryJson ? JSON.parse(existingHistoryJson) : []

      const newTrip: Trip = {
        id: new Date().toISOString(),
        date: new Date().toISOString(),
        distance: globalDistance,
        cities: [...globalCities],
        route: [...globalRoute]
      }

      history.push(newTrip)
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history))

      globalRoute = []
      globalDistance = 0
      globalCities = []
      lastCityCheckDistance = 0

      setRouteDisplay([])
      setDistanceDisplay(0)
      setCitiesCount(0)

      Alert.alert("Sucesso!", "Viagem slava no seu Diário de borderBottomWidth")
    } catch (e) {
      Alert.alert("Erro", "Falha ao salvar no histórico")
      console.error(e)
    }
  }

  return (
    <View style={styles.container}>
      { location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }}
          showsUserLocation={true}
          followsUserLocation={true}
        >
          <Polyline
            coordinates={routeDisplay}
            strokeColor='#790fcfff'
            strokeWidth={6}
          />
        </MapView>
      ) : (
        <View style={styles.loading}>
          <Text>Carregando GPS...</Text>
        </View>
      )}

      {/* HUD SUPERIOR */}
      <View style={styles.hudContainer}>
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>DISTANCIA</Text>
          <Text style={styles.hudValue}>{distanceDisplay.toFixed(2)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.hudItem}>
          <Text style={styles.hudLabel}>CIDADES</Text>
          <Text style={styles.hudValue}>{citiesCount}</Text>
        </View>
      </View>

      {/* BOTÃO RESET */}


      {/* BOTÃO INFERIOR */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isTracking ? styles.stopBtn : styles.startBtn]}
          onPress={toggleTracking}
        >
          <Text style={styles.btnText}>
            {isTracking ? 'PAUSAR' : 'ACELERAR'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetBtn} onPress={(() => {
          Alert.alert("Finalizar Viagem", "Deseja salvar essa viagem no histórico e começar uma nova?", [
            { text: "Cancelar", style: 'cancel' },
            { text: "Salvar e finalizar", onPress: () => {
              if(locationSubscription.current) {
                locationSubscription.current.remove();
                locationSubscription.current = null;
                setIsTracking(false)
              }
              saveTripToHistory();
            }},
            { text: "Só apagar (Reset)", style: "destructive", onPress: () => { resetTrip() } }
          ])
        })}>
          <MaterialCommunityIcons name="content-save" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hudContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    width: '90%',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 5,
  },
  hudItem: {
    alignItems: 'center'
  },
  divider: {
    width: 1, height: '80%', backgroundColor: '#ddd'
  },
  hudLabel: { fontSize: 10, color: '#888', fontWeight: 'bold' },
  hudValue: { fontSize: 24, fontWeight: 'bold' },
  resetBtn: {
    backgroundColor: '#0f72cfff',
    padding: 15,
    borderRadius: 30,
    marginLeft: 8,
  },
  buttonContainer: {
    position: 'absolute',
    flexDirection: 'row',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
  },
  startBtn: { backgroundColor: '#2ecc71' },
  stopBtn: { backgroundColor: '#e74c3c' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});