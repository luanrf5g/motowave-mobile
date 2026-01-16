import { useCallback, useState } from "react"
import { useFocusEffect } from "@react-navigation/native"
import { Alert } from "react-native"

import { supabase } from "../lib/supabase"
import { Level, LEVEL_SYSTEM, UserService } from "../services/userService"

export const usePassport = () => {
  const [loading, setLoading] = useState(true)

  const [username, setUsername] = useState<string>("Viajante")
  const [totalKm, setTotalKm] = useState(0)
  const [citiesCount, setCitiesCount] = useState(0)

  const [currentLevel, setCurrentLevel] = useState<Level>(LEVEL_SYSTEM[0])
  const [nextLevel, setNextLevel] = useState<Level>(LEVEL_SYSTEM[1])
  const [progress, setProgress] = useState(0)

  const loadStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const stats = await UserService.getUserStats(user.id)

      setUsername(stats.username)
      setTotalKm(stats.totalKm)
      setCitiesCount(stats.cititesCount)

      const levelInfo = UserService.calculateLevel(stats.totalKm)
      setCurrentLevel(levelInfo.current)
      setNextLevel(levelInfo.next)
      setProgress(levelInfo.progress)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadStats()
    }, [loadStats])
  )

  const handleSignOut = () => {
    Alert.alert("Desconectar", "Tem certeza que deseja sair?", [
      { text: "Ficar", style: 'cancel' },
      { text: "Sair", style: "destructive", onPress: UserService.singOut }
    ])
  }

  return {
    loading,
    username,
    totalKm,
    citiesCount,
    currentLevel,
    nextLevel,
    progress,
    loadStats,
    handleSignOut
  }
}