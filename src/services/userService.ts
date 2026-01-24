import { supabase } from "@/lib/supabase";

export interface Level {
  level: number,
  title: string,
  minKm: number,
  color: string,
}

export const LEVEL_SYSTEM: Level[] = [
  { level: 1, title: "Garagem", minKm: 0, color: "#7f8c8d" },
  { level: 2, title: "Primeira Marcha", minKm: 50, color: "#cd7f32" },
  { level: 3, title: "Rodageiro", minKm: 200, color: "#bdc3c7" },
  { level: 4, title: "Capitão de Estrada", minKm: 1000, color: "#f1c40f" },
  { level: 5, title: "Lenda do Asfalto", minKm: 5000, color: "#9b59b6" },
];

export const UserService = {
  calculateLevel: (km: number) => {
    let current = LEVEL_SYSTEM[0];
    let next = LEVEL_SYSTEM[1];

    for (let i = 0; i < LEVEL_SYSTEM.length; i++) {
      if (km >= LEVEL_SYSTEM[i].minKm) {
        current = LEVEL_SYSTEM[i]
        next = LEVEL_SYSTEM[i + 1] || {
          level: 99,
          title: 'Lenda Viva',
          minKm: 999999,
          color: '#fff'
        }
      }
    }

    let progress = 0;
    if (next.minKm < 999999) {
      const range = next.minKm - current.minKm
      const currentInRange = km - current.minKm
      progress = Math.min(Math.max(currentInRange / range, 0), 1)
    } else {
      progress = 1
    }

    return { current, next, progress }
  },

  getUserStats: async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('total_km, username')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      const { data: citiesData, error: citiesError } = await supabase
        .from('visited_cities')
        .select('city_name')
        .eq('user_id', userId)

      if (citiesError) throw citiesError

      const uniqueCities = new Set(citiesData?.map(c => c.city_name.trim().toUpperCase()))

      return {
        username: profile.username || "Viajante",
        totalKm: profile.total_km || 0,
        cititesCount: uniqueCities.size
      }
    } catch (error) {
      console.error("Erro ao buscar stats: ", error)
      throw error;
    }
  },

  singOut: async () => {
    return await supabase.auth.signOut()
  }
}