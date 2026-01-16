import { useNavigation } from "@react-navigation/native"
import { useEffect, useRef, useState } from "react"
import MapView from "react-native-maps"
import { CityMarker, CityService } from "../services/cityService"
import { supabase } from "../lib/supabase"
import { Alert } from "react-native"
import { showToast } from "../utils/toast"

export const useCityMap = () => {
  const navigation = useNavigation()
  const mapRef = useRef<MapView>(null)
  const [cities, setCities] = useState<CityMarker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return;

      const data = await CityService.getVisitedCities(user.id)
      setCities(data)

      if (data.length > 0) {
        setTimeout(() => {
          const coords = data.map((c) => ({
            latitude: c.lat,
            longitude: c.lon
          }));

          mapRef.current?.fitToCoordinates(coords, {
            edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
            animated: true
          })
        }, 800)
      }
    } catch (error) {
      showToast.error('Erro', 'Não foi possível carregar suas cidades conquistadas.')
    } finally {
      setLoading(false)
    }
  }

  return {
    cities,
    loading,
    mapRef,
    navigation
  }
}