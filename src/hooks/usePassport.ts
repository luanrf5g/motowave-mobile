import { useCallback, useState } from "react"
import { useFocusEffect } from "@react-navigation/native"

import { supabase } from "@/lib/supabase"

import { TripServices } from "@/services/tripServices"
import { ProfileService } from "@/services/profileService"

export interface Level {
  level_number: number,
  title: string,
  min_km: number,
  color: string,
}

export interface Badge {
  id: number,
  slug: string,
  name: string,
  description: string,
  icon: string,
  color: string,
  criteria_type: 'distance' | 'cities',
  criteria_value: number,
  unlocked: boolean,
}

export const usePassport = () => {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')

  // Stats do usuário
  const [totalKm, setTotalKm] = useState(0)
  const [citiesCount, setCitiesCount] = useState(0)

  // Gamification Data
  const [levels, setLevels] = useState<Level[]>([])
  const [badges, setBadges] = useState<Badge[]>([])

  // Nível Atual
  const [currentLevel, setCurrentLevel] = useState<Level>({
    level_number: 1, title: 'Carregando...', min_km: 0, color: '#333'
  })
  const [nextLevel, setNextLevel] = useState<Level>({
    level_number: 2, title: '...', min_km: 100, color: '#333'
  })
  const [progress, setProgress] = useState(0)

  const loadStats = async () => {
    setLoading(true)
    try {
      const profile = await ProfileService.getProfile()
      if (!profile) return;
      if (profile) setUsername(profile.username || 'Piloto')

      const { total_distance, visited_cities } = await TripServices.getUserStats()

      const userKm = total_distance || 0
      const userCities = visited_cities || 0

      setTotalKm(userKm)
      setCitiesCount(userCities)

      const { data: levelsData} = await supabase
        .from('gamification_levels')
        .select('*')
        .order('level_number', { ascending: true })

      if (levelsData && levelsData.length > 0) {
        setLevels(levelsData)
        calculateLevel(userKm, levelsData)
      }

      const { data: badgesData } = await supabase
        .from('gamification_badges')
        .select('*')
        .order('criteria_value', { ascending: true })

      if (badgesData) {
        const processedBadges = badgesData.map((badge: Badge) => {
          let isUnlocked = false

          if(badge.criteria_type === 'distance') {
            isUnlocked = userKm >= badge.criteria_value
          } else if (badge.criteria_type === 'cities') {
            isUnlocked = userCities >= badge.criteria_value
          }

          return { ...badge, unlocked: isUnlocked}
        })

        setBadges(processedBadges)
      }
    } catch (error) {
      console.log('Erro ao carregar passport: ', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateLevel = (km: number, levelList: Level[]) => {
    const current = levelList
      .slice()
      .reverse()
      .find(l => km >= l.min_km) || levelList[0]

    const next = levelList.find(l => l.level_number === current.level_number + 1)

    setCurrentLevel(current)

    if (next) {
      setNextLevel(next)
      //  Calculo da barra de progresso
      const totalRange = next.min_km - current.min_km
      const currentProgress = km - current.min_km
      const percent = Math.min(Math.max(currentProgress / totalRange, 0), 1)
      setProgress(percent)
    } else {
      // Nível máximo atingido
      setNextLevel({ ...current, title: 'Nível Máximo', min_km: km})
      setProgress(1)
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats()
    }, [])
  )

  return {
    loading,
    username,
    totalKm,
    citiesCount,
    currentLevel,
    nextLevel,
    progress,
    badges,
    loadStats
  }
}