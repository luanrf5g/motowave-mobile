import { supabase } from "../lib/supabase"

export interface CityMarker {
  city_name: string,
  state?: string,
  lat: number,
  lon: number,
}

export const CityService = {
  getVisitedCities: async (userId: string): Promise<CityMarker[]> => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_visited_cities', { target_user_id: userId })

      if (error) throw error;

      return data || []
    } catch (error: any) {
      console.error('Erro no CityService: ', error.message)
      throw error;
    }
  }
}