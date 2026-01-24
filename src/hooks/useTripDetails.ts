import { useEffect, useRef, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native"
import MapView from "react-native-maps";

import { showToast } from "@/utils/toast";

import { TripFullDetail, TripServices } from "@/services/tripServices";

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

  const focusMap = (data: TripFullDetail, bottom: number) => {
    if (mapRef.current && data.route_coords.length > 0) {
      mapRef.current.fitToCoordinates(data.route_coords, {
        edgePadding: {
          top: 100,
          right: 50,
          bottom: bottom,
          left: 50
        },
        animated: true
      });
    }
  }

  const fetchDetails = async () => {
    try {
      const data = await TripServices.getTripDetails(tripId)
      setTrip(data)

      setTimeout(() => {
        focusMap(data, 250)
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
    focusMap,
    navigation
  }
}