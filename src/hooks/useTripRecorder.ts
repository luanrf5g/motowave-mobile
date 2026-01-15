import * as Location from 'expo-location'
import { useEffect, useRef, useState } from 'react';
import { City } from '../services/tripServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, ToastAndroid } from 'react-native';
import haversine from 'haversine';

const STORAGE_KEYS = {
  ROUTE: '@motowave:route',
  DISTANCE: '@motowave:distance',
  CITIES: '@motowave:cities'
}

const MIN_TIME_BETWEEN_CHECKS = 5 * 60 * 1000;

export const useTripRecorder = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [distance, setDistance] = useState(0)
  const [route, setRoute] = useState<Location.LocationObjectCoords[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [isTracking, setIsTracking] = useState(false)

  // variaveis que mudam com menos frequencia
  const locationSubstription = useRef<Location.LocationSubscription | null>(null)
  const lastCityCheckTime = useRef<number>(0)

  // Variaveis do cache da viagem atual ( Offline )
  const sessionRef = useRef({
    distance: 0,
    route: [] as Location.LocationObjectCoords[],
    cities: [] as City[],
    lastCityCheckDist: 0
  })

  // Carregamento da localização
  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const current = await Location.getCurrentPositionAsync({})
      setLocation(current)
    }
  }

  // Carregamento dos dados do asyncstorage
  const loadPersistedData = async () => {
    try {
      const saved = await AsyncStorage.multiGet([
        STORAGE_KEYS.ROUTE,
        STORAGE_KEYS.DISTANCE,
        STORAGE_KEYS.CITIES
      ])

      if (saved[0][1]) {
        const parsedRoute = JSON.parse(saved[0][1]);
        sessionRef.current.route = parsedRoute;
        setRoute(parsedRoute)
      }

      if (saved[1][1]) {
        const parsedDist = parseFloat(saved[1][1]);
        sessionRef.current.distance = parsedDist;
        sessionRef.current.lastCityCheckDist = parsedDist;
        setDistance(parsedDist);
      }

      if (saved[2][1]) {
        const parsedCities = JSON.parse(saved[2][1]);
        sessionRef.current.cities = parsedCities;
        setCities(parsedCities);
      }
    } catch (e) {
      console.error('Erro ao carregar dados locais', e);
    }
  }

  // Carregamento inicial dos dados do asyncstorage e carregamento da localização
  useEffect(() => {
    loadPersistedData();
    getCurrentLocation();

    return () => {
      if (locationSubstription.current) locationSubstription.current.remove();
    }
  }, [])

  // função para salvar os dados localmente ( offline )
  const saveLocalSession = async () => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ROUTE, JSON.stringify(sessionRef.current.route)],
        [STORAGE_KEYS.DISTANCE, sessionRef.current.distance.toString()],
        [STORAGE_KEYS.CITIES, JSON.stringify(sessionRef.current.cities)]
      ])
    } catch (e) {
      console.error('Erro no backup local', e)
    }
  }

  // Tratamento de erro ao tentar checar uma cidade
  const handleCityCheckError = (e: any) => {
    const msg = e.message || '';
    if (msg.includes('rate Limit')) {
      console.warn('⚠️ Cota GPS. Pausando 10min.');
      lastCityCheckTime.current = Date.now() + (10 * 60 * 1000);
    }
  }

  // Checagem de cidades
  const checkCurrentCity = async (coords: Location.LocationObjectCoords) => {
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude
      })

      if (address.length > 0) {
        const city = address[0].city || address[0].subregion;
        const state = address[0].region || address[0].district || 'BR';

        if (!city) return;

        const normalizedCity = city.trim().toUpperCase();
        const alreadyExists = sessionRef.current.cities.some(c => c.name.toUpperCase() === normalizedCity)

        if (!alreadyExists) {
          const newCity = {
            name: city,
            state: state,
            latitude: coords.latitude,
            longitude: coords.longitude
          }

          sessionRef.current.cities.push(newCity)
          setCities([...sessionRef.current.cities])

          if (Platform.OS === 'android') {
            ToastAndroid.show(`📍 ${city}`, ToastAndroid.SHORT)
          }

          await saveLocalSession();
        }
      }
    } catch (e) {
      handleCityCheckError(e)
    }
  }

  // Atualização de Localização e verificações para conferencia de cidade e salvamento local
  const updateLocation = (newLocation: Location.LocationObject) => {
    const now = Date.now();
    const newPoint = newLocation.coords;

    if (sessionRef.current.route.length === 0) {
      sessionRef.current.route = [newPoint];
      checkCurrentCity(newPoint)
    } else {
      const lastPoint = sessionRef.current.route[sessionRef.current.route.length - 1]
      const dist = haversine(lastPoint, newPoint, { unit: 'km' }) || 0;

      if (dist > 0.05) {
        sessionRef.current.distance += dist;
        sessionRef.current.route.push(newPoint)

        const timeDiff = now - lastCityCheckTime.current;
        const distDiff = sessionRef.current.distance - sessionRef.current.lastCityCheckDist;

        if (distDiff > 3 && timeDiff > MIN_TIME_BETWEEN_CHECKS) {
          checkCurrentCity(newPoint)
          sessionRef.current.lastCityCheckDist = sessionRef.current.distance;
          lastCityCheckTime.current = now;
        }
      }
    }

    setLocation(newLocation)
    setDistance(sessionRef.current.distance)
    setRoute([...sessionRef.current.route])
    saveLocalSession();
  }

  // Controle de viagem
  const toggleTracking = async () => {
    if (isTracking) {
      if (locationSubstription.current) locationSubstription.current.remove();
      locationSubstription.current = null;
      setIsTracking(false)
    } else {
      try {
        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 2000,
            distanceInterval: 10
          },
          updateLocation
        );
        locationSubstription.current = sub
        setIsTracking(true)
      } catch (e) {
        console.error('Erro ao iniciar GPS', e);
      }
    }
  }

  // Controle para resetar todos os dados locais e visuais
  const resetTrip = async () => {
    sessionRef.current = { distance: 0, route: [], cities: [], lastCityCheckDist: 0 }
    setDistance(0)
    setRoute([])
    setCities([])
    await AsyncStorage.multiRemove([STORAGE_KEYS.ROUTE, STORAGE_KEYS.DISTANCE, STORAGE_KEYS.CITIES])
  }

  return {
    location,
    distance,
    route,
    cities,
    isTracking,
    toggleTracking,
    resetTrip
  }
}