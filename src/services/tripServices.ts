import { supabase } from "../lib/supabase";
import { Alert } from "react-native";

// tipagem do corpo das cidades
export interface City {
  name: string,
  state: string;
  latitude: number,
  longitude: number
}

export interface Route {
  latitude: number,
  longitude: number
}

// tipagem do body da requisição de criar uma trip
export interface CreateTripDTO {
  title: string,
  distance: number,
  route: Route[],
  cities: City[]
}

// tipagem do response do getHistory
export interface TripHistoryItem {
  id: string,
  created_at: string,
  total_distance: number,
  title: string,
  start_lat: number | null,
  start_lon: number | null
}

const timeoutPromise = (ms: number) => {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("Tempo limite excedido. Verifique sua conexao!")), ms))
}

export const TripServices = {

  // Função para buscar o histórico de viagens
  getHistory: async (): Promise<TripHistoryItem[]> => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('id, created_at, total_distance, title, start_lat, start_lon')
        .order('created_at', { ascending: true })

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error("Erro ao buscar histórico: ", error.message)
      throw error;
    }
  },

  // Função para deletar uma viagem
  deleteTrip: async (id: string): Promise<{ success: boolean, message?: string }> => {
    try {
      const { error, data } = await supabase
        .from('trips')
        .delete()
        .eq('id', id)
        .select()

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          success: false,
          message: "Registro não encontrado ou sem permissão."
        }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  },

  saveToCloud: async (data: CreateTripDTO, userId: string): Promise<boolean> => {
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();

      if (!session || sessionError) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session) {
          throw new Error("Erro na autenticação do usuário.")
        }
      }

      const firstPoint = data.route.length > 0 ? data.route[0] : null;

      const uploadProcess = async () => {

        // Inserir Viagem
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


        // Transformar o JSON no modelo text WKT para geometry
        const routeWKT = data.route
          .map(p => `${p.longitude} ${p.latitude}`)
          .join(',')

        // Inserir a rota
        const { error: routeError } = await supabase
          .from('trip_routes')
          .insert({
            trip_id: tripId,
            path: `LINESTRING(${routeWKT})`
          })

        if (routeError) throw new Error(`Erro na rota: ${routeError.message}`);

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

          if (citiesError) console.warn(`Aviso: Erro ao salvar as cidades: ${citiesError.message}`)
        }

        return true
      };

      await Promise.race([uploadProcess(), timeoutPromise(15000)])
      return true;
    } catch (error: any) {
      console.log("TripService Error: ", error)
      let msg = error.message;

      if (error.message.includes("row-level secutiry")) {
        msg = "Sessão expirada. Tente sair e entrar no app novamente."
      } else if (error.message.includes("Tempo limite")) {
        msg = "Internet instável. Verifique sua conexao."
      }

      Alert.alert("Erro no envio", msg);
      return false;
    }
  }
}