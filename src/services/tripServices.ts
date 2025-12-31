import { LocationObjectCoords } from "expo-location";
import { supabase } from "../lib/supabase";
import { Alert } from "react-native";

export interface City {
  name: string,
  state: string,
  latitude: number,
  longitude: number
}

export interface Route {
  latitude: number,
  longitude: number
}

interface TripData {
  title: string,
  distance: number,
  route: Route[],
  cities: City[]
}

const timeoutPromise = (ms: number) => {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("Tempo limite excedido. Verifique sua Conexão.")), ms))
}

export const TripServices = {
  saveToCloud: async (data: TripData, userId: string): Promise<boolean> => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (!session || sessionError) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError || !refreshData.session) {
          throw new Error("Erro na autenticação do usuário.")
        }
      }

      const firstPoint = data.route.length > 0 ? data.route[0] : null;

      const uploadProcess = async () => {
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .insert({
            user_id: userId,
            total_distance: data.distance,
            title: data.title,
            start_lat: firstPoint ? firstPoint.latitude : null,
            start_lon: firstPoint ? firstPoint.longitude : null
          })
          .select('id')
          .single()

        if (tripError) throw new Error(`Erro ao salvar viagem: ${tripError.message}`)
        const tripId = tripData.id

        const routeWKT = data.route
          .map(p => `${p.longitude} ${p.latitude}`)
          .join(',')

        const { error: routeError } = await supabase
          .from('trip_routes')
          .insert({
            trip_id: tripId,
            path: `LINESTRING(${routeWKT})`
          })

        if (routeError) throw new Error(`Erro na rota: ${routeError.message}`)

        if (data.cities.length > 0) {
          const citiesToInsert = data.cities.map(c => ({
            user_id: userId,
            trip_id: tripId,
            city_name: c.name,
            state: c.state,
            location: `POINT(${c.longitude} ${c.latitude})`
          }))

          const { error: citiesError } = await supabase
            .from('visited_cities')
            .insert(citiesToInsert)

          if (citiesError) console.warn(`Aviso: Erro ao salvar cidades: ${citiesError.message}`)
        }

        return true;
      }

      await Promise.race([uploadProcess(), timeoutPromise(15000)])
      return true;
    } catch (error: any) {
      console.log("TripService Error: ", error)

      let msg = "Falha ao salvar.";
      if (error.message.includes("row-level security")) {
        msg = "Sessão expirada. Tente sair e entrar no app novamente."
      } else if (error.message.includes("Tempo Limite")) {
        msg = "Internet instável. Verifique sua conexão e tente novamente."
      } else {
        msg = error.message;
      }

      Alert.alert("Erro no envio", msg)
      return false;
    }
  }
}