import { useNavigation, useRoute } from "@react-navigation/native"
import { useEffect, useRef, useState } from "react";
import { TripFullDetail, TripServices } from "../services/tripServices";
import MapView from "react-native-maps";
import { Alert } from "react-native";
import { showToast } from "../utils/toast";

export const useTripDetails = () => {
  const route = useRoute()
  const navigation = useNavigation();
  const { tripId } = route.params as { tripId: string }

  const [trip, setTrip] = useState<TripFullDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<MapView>(null)

  useEffect(() => {
    fetchDetails()
  }, [])

  const fetchDetails = async () => {
    try {
      const data = await TripServices.getTripDetails(tripId)
      setTrip(data)

      setTimeout(() => {
        if (mapRef.current && data.route_coords.length > 0) {
          mapRef.current.fitToCoordinates(data.route_coords, {
            edgePadding: { top: 100, right: 50, bottom: 250, left: 50 },
            animated: true
          })
        }
      }, 500)
    } catch (error) {
      showToast.error('Erro', 'Não foi possível carregar os Detalhes.')
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  return {
    trip,
    loading,
    mapRef,
    navigation
  }
}