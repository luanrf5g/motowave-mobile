import * as Location from 'expo-location'
import { useEffect, useRef, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ActivityIndicator, Alert, Dimensions, Platform, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native"
import haversine from "haversine"
import { supabase } from "../lib/supabase"
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { BlurView } from 'expo-blur'

import { City, Route, TripServices } from "../services/tripServices"
import { SaveTripModal } from '../components/saveTripModal'
import { darkMapStyle } from '../styles/mapStyle'

const STORAGE_KEYS = {
  ROUTE: '@motowave:route',
  DISTANCE: '@motowave:distance',
  CITIES: '@motowave:cities'
}

let tripSession = {
  distance: 0,
  route: [] as Location.LocationObjectCoords[],
  cities: [] as City[],
  lastCityCheckCity: 0
}

export const Home = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [distanceDisplay, setDistanceDisplay] = useState(0)
  const [routeDisplay, setRouteDisplay] = useState<Location.LocationObjectCoords[]>([])
  const [citiesCount, setCitiesCount] = useState(0)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const locationSubscription = useRef<Location.LocationSubscription | null>(null)

  const saveLocalSession = async () => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ROUTE, JSON.stringify(tripSession.route)],
        [STORAGE_KEYS.DISTANCE, tripSession.distance.toString()],
        [STORAGE_KEYS.CITIES, JSON.stringify(tripSession.cities)]
      ])
    } catch (e) {
      console.error("Erro ao salvar localmente: ", e)
    }
  }

  const checkCurrentCity = async (coords: Location.LocationObjectCoords) => {
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude
      })

      if(address.length > 0) {
        const city = address[0].city || address[0].subregion
        const state = address[0].region || address[0].district || 'BR'
        const normalizedCity = city?.trim().toUpperCase()

        const alreadyExists = tripSession.cities.some(c => c.name.toUpperCase() === normalizedCity)

        if(city && state && !alreadyExists) {
          tripSession.cities.push({
            name: city,
            state: state,
            latitude: coords.latitude,
            longitude: coords.longitude
          })

          setCitiesCount(tripSession.cities.length)
          if (Platform.OS === 'android') ToastAndroid.show(`📍 ${city}`, ToastAndroid.SHORT)
          await saveLocalSession()
        }
      }
    } catch (e) {
      console.error('Error geo: ', e)
    }
  }

  const updateLocation = (newLocation: Location.LocationObject) => {
    if (isSaving) return;

    let newPoint: Location.LocationObjectCoords = {
      latitude: newLocation.coords.latitude,
      longitude: newLocation.coords.longitude,
      altitude: null, accuracy: null, heading: null, speed: null, altitudeAccuracy: null
    };

    // PROTEÇÃO CONTRA ARRAY CONGELADO
    if(!Array.isArray(tripSession.route)) {
      tripSession.route = []
    }

    if(tripSession.route.length > 0 ) {
      let lastPoint = tripSession.route[tripSession.route.length - 1];
      let dist = haversine(lastPoint, newPoint, { unit: 'km' }) || 0;

      if(dist > 0.005) {
        tripSession.distance += dist
        tripSession.route = [...tripSession.route, newPoint]

        if((tripSession.distance - tripSession.lastCityCheckCity > 2) || tripSession.cities.length === 0) {
          checkCurrentCity(newPoint)
          tripSession.lastCityCheckCity = tripSession.distance;
        }
      }
    } else {
      tripSession.route = [newPoint]
      checkCurrentCity(newPoint)
    }

    setLocation(newLocation)
    setDistanceDisplay(tripSession.distance)
    setRouteDisplay(tripSession.route)
    saveLocalSession()
  }

  useEffect(() => {
    const initApp = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if(status !== 'granted') {
        Alert.alert("Permissão necessária", "Habilite o GPS nas configurações")
        return;
      }

      const saved = await AsyncStorage.multiGet([
        STORAGE_KEYS.ROUTE, STORAGE_KEYS.DISTANCE, STORAGE_KEYS.CITIES
      ])

      if(saved[0][1]) {
        tripSession.route = JSON.parse(saved[0][1])
        setRouteDisplay(tripSession.route)
      }

      if(saved[1][1]) {
        tripSession.distance = parseFloat(saved[1][1])
        setDistanceDisplay(tripSession.distance)
        tripSession.lastCityCheckCity = tripSession.distance
      }

      if(saved[2][1]) {
        tripSession.cities = JSON.parse(saved[2][1])
        setCitiesCount(tripSession.cities.length)
      }

      const current = await Location.getCurrentPositionAsync({});
      setLocation(current)
    }

    initApp();
    return () => {
      if(locationSubscription.current) locationSubscription.current.remove()
    }
  }, [])

  const toggleTracking = async () => {
    if(isSaving) {
      Alert.alert("Aguarde", "Salvando viagem em andamento.")
      return;
    }

    if(isTracking) {
      if(locationSubscription.current) {
        locationSubscription.current.remove();
      }
      locationSubscription.current = null;
      setIsTracking(false)
    } else {
      try {
        if(locationSubscription.current) locationSubscription.current.remove();

        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 2000,
            distanceInterval: 10,
          },
          updateLocation
        )
        locationSubscription.current = sub;
        setIsTracking(true)
      } catch (e) {
        Alert.alert("Erro GPS", "Não foi possível o rastreamento")
      }
    }
  }

  const handleFinishPress = () => {
    Alert.alert("Finalizar viagem", "O que deseja fazer?", [
      { text: 'Cancelar', style: 'cancel'},
      { text: 'Apagar', style: 'destructive', onPress: confirmReset },
      {
        text: 'Salvar na Nuvem',
        onPress: () => {
          if(tripSession.distance < 0.05) {
            Alert.alert("Alerta Viagem", "Viagem muito curta para ser salva!")
            return;
          }
          setShowSaveModal(true);
        }
      }
    ])
  }

  const confirmReset = () => {
    Alert.alert("Confirmar", "Deseja realmente apagar a viagem atual?", [
      { text: 'Cancelar', style: 'cancel'},
      { text: 'Apagar', style: 'destructive', onPress: resetCurrentTrip }
    ])
  }

  const resetCurrentTrip = async () => {
    tripSession = { route: [], cities: [], distance: 0, lastCityCheckCity: 0 }
    setDistanceDisplay(0)
    setRouteDisplay([])
    setCitiesCount(0)
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ROUTE, STORAGE_KEYS.DISTANCE, STORAGE_KEYS.CITIES
    ])
  }

  const handleConfirmSave = async (title: string) => {
    setIsSaving(true)

    const { data: { user } } = await supabase.auth.getUser()

    if(!user) {
      setIsSaving(false)
      Alert.alert("Login Necessário", "Entre na sua conta para poder salvar a viagem.")
      return;
    }

    const success = await TripServices.saveToCloud({
      title,
      distance: tripSession.distance,
      route: tripSession.route,
      cities: tripSession.cities
    }, user.id)

    setIsSaving(false)

    if(success) {
      setShowSaveModal(false)
      await resetCurrentTrip();
      Alert.alert("Sucesso!", "Viagem salva no seu passaporte!")
    }
  }

  return (
    <View style={styles.container}>
      {location
        ? (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            customMapStyle={darkMapStyle}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005
            }}
            region={location ? {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005
            } : undefined}
            showsUserLocation
          >
            <Polyline coordinates={routeDisplay} strokeColor="#27AE60" strokeWidth={6} />
          </MapView>
        )
        : (
          <View style={styles.loading}><ActivityIndicator size="large" color="#27AE60"/></View>
        )}

        <View style={styles.hudWrapper}>
          <BlurView intensity={30} tint='light' style={styles.glassContainer}>
            <View style={styles.hudItem}>
              <Text style={styles.hudLabel}>DISTÂNCIA</Text>
              <Text style={styles.hudValue}>
                {distanceDisplay.toFixed(1)}
                <Text style={styles.hudUnit}>km</Text>
              </Text>
            </View>

            <View style={styles.neonDivider}/>

            <View style={styles.hudItem}>
              <Text style={styles.hudLabel}>CIDADES</Text>
              <Text style={styles.hudValue}>{citiesCount}</Text>
            </View>
          </BlurView>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.mainButton, isTracking
              ? styles.stopBtn
              : styles.startBtn
            ]}
            onPress={toggleTracking}
          >
            <Text style={styles.btnText}>
              {isTracking ? 'PAUSAR' : 'ACELERAR'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
            onPress={handleFinishPress}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <MaterialCommunityIcons name="flag-checkered" size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <SaveTripModal
          visible={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onConfirm={handleConfirmSave}
          distance={tripSession.distance}
          cities={tripSession.cities}
          isSaving={isSaving}
        />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' },
  hudWrapper: { position: 'absolute', top: 60, alignSelf: 'center', width: '90%', borderRadius: 25, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(39, 174, 96, 0.3)', elevation: 10, shadowColor: '#27AE60', shadowOpacity: 0.4, shadowRadius: 15, shadowOffset: { width: 0, height: 0 }, },
  glassContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 20, borderRadius: 18, },
  hudItem: { alignItems: 'center' },
  hudLabel: { fontSize: 10, color: '#fff', fontWeight: 'bold', letterSpacing: 2, marginBottom: 5 },
  hudValue: { fontSize: 32, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(255, 255, 255, 0.3)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  hudUnit: { fontSize: 14, fontWeight: '600', },
  neonDivider: { width: 1, height: '60%', backgroundColor: 'rgba(39, 174, 96, 0.5)', shadowColor: '#27AE60', shadowOpacity: 1, shadowRadius: 5, },
  buttonContainer: { position: 'absolute', bottom: 40, flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  mainButton: { paddingHorizontal: 50, paddingVertical: 18, borderRadius: 35, elevation: 8, flexDirection: 'row', alignItems: 'center' },
  startBtn: { backgroundColor: '#1E8449' },
  stopBtn: { backgroundColor: '#C0392B' },
  saveBtn: { backgroundColor: '#2C3E50', padding: 18, borderRadius: 35, marginLeft: 15, elevation: 8 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
});