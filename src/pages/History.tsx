import { Alert, FlatList, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import { useCallback, useState } from "react";
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

import { supabase } from "../lib/supabase";
import { CustomHeader } from "../components/CustomHeader";

interface Trip {
  id: string;
  title: string;
  created_at: string;
  total_distance: number;
  start_lat: number | null;
  start_lon: number | null;
}

export const History = () => {
  const [history, setHistory] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setHistory(data);
      }
    } catch (e: any) {
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
    Alert.alert("Apagar", "Tem certeza? Isso apagará a rota e as cidades dessa viagem também.", [
      { text: "Cancelar", style: 'cancel'},
      { text: "Sim, apagar", style: 'destructive', onPress: async () => {
        const { error } = await supabase.from('trips').delete().eq('id', id);

        if (!error) {
          loadHistory();
        } else {
          Alert.alert("Erro", "Não foi possível apagar.");
        }
      }}
    ]);
  };

  const renderCard = ({ item }: { item: Trip }) => {
    // Data formatada
    const dateFormatted = format(new Date(item.created_at), "d 'de' MMM, yyyy", { locale: ptBR });

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('TripDetails', { tripId: item.id })}
        style={styles.newCard}
        activeOpacity={0.1}
      >
        <View style={styles.tripCard}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
             <Text style={styles.titleTrip}>{item.title || "Viagem sem nome"}</Text>
             <MaterialCommunityIcons
                name="trash-can-outline"
                size={24}
                color="#C0392B"
                onPress={() => deleteTrip(item.id)}
             />
          </View>

          <View style={styles.tripInfo}>
            <View style={styles.tripInfoView}>
              <Text style={styles.tripInfoSubtitle}>{item.total_distance.toFixed(1)} km percorridos</Text>
            </View>
          </View>

          {/* Mini Mapa Leve */}
          <View style={[styles.cardMapView, {borderWidth: 1, borderColor: '#ddd'}]}>
            {item.start_lat !== null && item.start_lon !== null ? (
              <MapView
                style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
                initialRegion={{
                  latitude: item.start_lat,
                  longitude: item.start_lon,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005
                }}
                liteMode={true}
                zoomEnabled={false}
                pitchEnabled={false}
                scrollEnabled={false}
              >
                 <Marker coordinate={{ latitude: item.start_lat, longitude: item.start_lon }} />
              </MapView>
            ) : (
                <View style={{flex:1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee'}}>
                    <Text style={{color: '#999'}}>Sem mapa disponível</Text>
                </View>
            )}
          </View>
        </View>
        <Text style={styles.tripCardFooter}>REALIZADA EM {dateFormatted.toUpperCase()}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Diário de Bordo" subtitle="Minhas Aventuras" />

      <View style={styles.content}>

        {loading ? (
            <ActivityIndicator size="large" color="#fff" style={{marginTop: 50}} />
        ) : history.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="road-variant" size={60} color='#ddd' />
            <Text style={styles.emptyText}>Nenhuma viagem na nuvem.</Text>
            <Text style={styles.emptySubtext}>Suas aventuras salvas aparecerão aqui.</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={item => item.id}
            renderItem={renderCard}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshing={loading}
            onRefresh={loadHistory}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 20,
    fontWeight: 'bold'
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5
  },
  newCard: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: '#1F9893',
    borderRadius: 40,
    marginBottom: 20,
  },
  tripCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 32,
    padding: 15,
  },
  titleTrip: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1
  },
  tripInfo: {
    marginVertical: 10,
  },
  tripInfoView: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  tripInfoSubtitle: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500'
  },
  cardMapView: {
    width: '100%',
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 10
  },
  tripCardFooter: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 1
  }
});