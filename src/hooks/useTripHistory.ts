import { useCallback, useState } from "react"
import { useFocusEffect } from "@react-navigation/native"
import { Alert } from "react-native"

import { showToast } from "@/utils/toast"

import { TripHistoryItem, TripServices } from "@/services/tripServices"

export const useTripHistory = () => {
  const [history, setHistory] = useState<TripHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadHistory = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const data = await TripServices.getHistory();
      setHistory(data)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadHistory()
    }, [loadHistory])
  )

  const handleDeleteTrip = (id: string) => {
    Alert.alert("Apagar Registro", "Essa ação não pode ser desfeita.", [
      { text: "Cancelar", style: 'cancel' },
      {
        text: "Apagar",
        style: 'destructive',
        onPress: async () => {
          const result = await TripServices.deleteTrip(id)

          if (result.success) {
            setHistory(prev => prev.filter(item => item.id !== id))
          } else {
            showToast.error('Erro', result.message || 'Não foi possível apagar a viagem.')
          }
        }
      }
    ])
  }

  return {
    history,
    loading,
    loadHistory,
    handleDeleteTrip
  }
}