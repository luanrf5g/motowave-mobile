import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, StatusBar } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { supabase } from "../lib/supabase";

import { CustomHeader } from '../components/CustomHeader';
import { darkMapStyle } from "../styles/mapStyle";

interface Trip {
  id: string;
  created_at: string;
  total_distance: number;
  title: string;
  start_lat: number;
  start_lon: number;
}

export const History = () => {
  const navigation = useNavigation<any>();
  const [history, setHistory] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    if(history.length === 0) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('id, created_at, total_distance, title, start_lat, start_lon')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setHistory(data);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const deleteTrip = async (id: string) => {
    Alert.alert("Apagar Registro", "Essa ação não pode ser desfeita.", [
      { text: "Cancelar", style: 'cancel'},
      {
        text: "Apagar",
        style: 'destructive',
        onPress: async () => {
        const { error, data } = await supabase
          .from('trips')
          .delete()
          .eq('id', id)
          .select();

        if (error) {
          Alert.alert("Erro", "Não foi possível apagar: " + error.message);
          return;
        }

        if (data && data.length === 0) {
          Alert.alert(
            "Atenção",
            "A viagem não foi apagada. Verifique se você é o dono deste registro."
          );
        } else {
          loadHistory();
        }
      }
      }
    ]);
  };

  const renderCard = ({ item }: { item: Trip }) => {
    const dateFormatted = format(new Date(item.created_at), "d MMM, yyyy", { locale: ptBR });
    const hasStartPoint = item.start_lat !== 0 && item.start_lon !== 0;

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('TripDetails', { tripId: item.id })}
      >
        {/* Cabeçalho do Card: Título e Delete */}
        <View style={styles.cardHeader}>
           <View style={styles.titleContainer}>
             <MaterialCommunityIcons name="map-check" size={20} color="#27AE60" style={{marginRight: 8}} />
             <Text style={styles.cardTitle} numberOfLines={1}>{item.title || "Viagem sem nome"}</Text>
           </View>
           <TouchableOpacity onPress={() => deleteTrip(item.id)} style={styles.deleteBtn}>
             <MaterialCommunityIcons name="trash-can-outline" size={22} color="#E74C3C" />
           </TouchableOpacity>
        </View>

        {/* Mapa Miniatura */}
        <View style={styles.mapPreviewContainer}>
          {hasStartPoint ? (
            <MapView
              provider={PROVIDER_GOOGLE}
              customMapStyle={darkMapStyle}
              style={StyleSheet.absoluteFillObject}
              initialRegion={{
                latitude: item.start_lat,
                longitude: item.start_lon,
                latitudeDelta: 0.02, // Zoom mais próximo para focar no ponto
                longitudeDelta: 0.02
              }}
              liteMode={true} // Essencial para performance em listas
              zoomEnabled={false}
              pitchEnabled={false}
              scrollEnabled={false}
              // customMapStyle={darkMapStyle} // Opcional: Se quiser o mapa dark também
            >
               <Marker
                coordinate={{ latitude: item.start_lat, longitude: item.start_lon }}
                pinColor="#27AE60" // Pino verde para combinar
               />
            </MapView>
          ) : (
              <View style={styles.noMapPlaceholder}>
                  <MaterialCommunityIcons name="map-marker-off" size={30} color="#444" />
                  <Text style={styles.noMapText}>Sem localização inicial</Text>
              </View>
          )}
        </View>

        {/* Rodapé do Card: Info e Data */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.distanceValue}>
              {item.total_distance.toFixed(1)} <Text style={styles.distanceUnit}>km</Text>
            </Text>
          </View>
          <View style={styles.dateContainer}>
             <MaterialCommunityIcons name="calendar-blank" size={14} color="#888" style={{marginRight: 4}} />
             <Text style={styles.dateText}>{dateFormatted}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Header Padrão */}
      <CustomHeader showNotification={false} />

      {loading && history.length === 0 ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#27AE60" />
          </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
             <MaterialCommunityIcons name="road-variant" size={50} color='#27AE60' />
          </View>
          <Text style={styles.emptyText}>Nenhuma viagem ainda.</Text>
          <Text style={styles.emptySubtext}>Acelere e sua história aparecerá aqui.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadHistory}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Fundo Dark
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    padding: 20,
    paddingBottom: 40
  },

  // --- ESTILOS DO CARD ---
  cardContainer: {
    backgroundColor: '#1E1E1E', // Card Cinza Chumbo
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A', // Borda sutil
    overflow: 'hidden',
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingBottom: 10
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flexShrink: 1
  },
  deleteBtn: {
    padding: 5
  },

  // Mapa
  mapPreviewContainer: {
    height: 130,
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#222' // Fundo enquanto carrega o mapa
  },
  noMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#252525'
  },
  noMapText: {
    color: '#666',
    fontSize: 12,
    marginTop: 5
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 15,
    paddingTop: 12
  },
  distanceValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#27AE60', // Verde Destaque
    letterSpacing: -0.5
  },
  distanceUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27AE60'
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    textTransform: 'uppercase'
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333'
  },
  emptyText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold'
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8
  },
});