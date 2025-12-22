import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Polyline } from "react-native-maps";

const HISTORY_KEY = '@motowave:history'

interface Cities {
  name: string,
  latitude: number,
  longitude: number
}

export interface Trip {
  id: string;
  date: string;
  distance: number;
  cities: Cities[];
  route: { latitude: number, longitude: number }[];
}[]

export const History = () => {
  const [history, setHistory] = useState<Trip[]>([]);

  const loadHistory = async () => {
    try {
      const json = await AsyncStorage.getItem(HISTORY_KEY)
      if (json) {
        const parsed: Trip[] = JSON.parse(json);
        setHistory(parsed.reverse())
      }
    } catch (e) {
      console.error(e)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadHistory()
    }, [])
  )

  const deleteTrip = async (id: string) => {
    Alert.alert("Apagar", "Tem certeza?", [
      { text: "Cancelar", style: 'destructive'},
      { text: "Sim", onPress: async () => {
        const newHistory = history.filter(item => item.id !== id);
        setHistory(newHistory)
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory.reverse()))
        loadHistory()
      }}
    ])
  };

  const renderCard = ({ item }: { item: Trip}) => {
    const initalRegion = item.route.length > 0 ? {
      latitude: item.route[0].latitude,
      longitude: item.route[0].latitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01
    } : undefined

    return (
      <View style={styles.newCard}>
        <View style={styles.tripCard}>
          <Text style={styles.titleTrip}>Viagem de Férias</Text>
          <View style={styles.tripInfo}>
            {item.cities.length <= 1 ? (
              <Text style={{textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginBottom: 8,}}>
                Rolezinho local
              </Text>
            ) : (
              <View style={styles.tripInfoView}>
                <Text style={styles.titleInfoTrip}>{item.cities[0].name}</Text>
                <Text>{`->`}</Text>
                <Text style={styles.titleInfoTrip}>{item.cities[item.cities.length - 1].name}</Text>
              </View>
            )}
            <View style={styles.tripInfoView}>
              <Text style={styles.tripInfoSubtitle}>{item.distance.toFixed(2)} Km Totais</Text>
              <Text style={styles.tripInfoSubtitle}>{item.cities.length}
                {item.cities.length > 1
                  ? ` Conhecida`
                  : ` Conhecidas`
                }
              </Text>
            </View>
          </View>
          <View style={styles.cardMapView}>
            {initalRegion && (
              <MapView
                style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
                initialRegion={{
                  latitude: item.route[0].latitude,
                  longitude: item.route[0].longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01
                }}
                zoomEnabled={false}
                pitchEnabled={false}
                scrollEnabled={false}
              >
                <Polyline
                  coordinates={item.route}
                  strokeColor="#ff4500"
                  strokeWidth={4}
                />
              </MapView>
            )}
          </View>
        </View>
        <Text
          style={styles.tripCardFooter}>
          CREATED {format(item.date, 'MMM d, yyyy')}
        </Text>
      </View>
      )
  }

  const test: string[] = [];

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Meu Diário de Bordo</Text>
      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="road-variant" size={60} color='#ddd' />
          <Text style={styles.emptyText}>Nenhuma viagem gravada ainda.</Text>
          <Text style={styles.emptySubtext}>Vá para o mapa e inicie uma aventura.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#223C39',
    padding: 20
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center'
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'hidden'
  },
  cardHeader: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dateText: { fontSize: 12, color: '#999' },
  tripTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  mapContainer: {
    height: 150,
    width: '100%',
    backgroundColor: '#eee'
  },

  cardFooter: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-around'
  },
  stat: { alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#999', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100
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
    // alignItems: 'center',
    borderRadius: 40,
  },

  tripCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 32,
    padding: 12,
  },

  titleTrip: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center'
  },

  tripInfo: {
    marginVertical: 16,
  },

  tripInfoView: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  titleInfoTrip: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  tripInfoSubtitle: {
    fontSize: 16,
    color: '#000'
  },

  cardMapView: {
    width: '100%',
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 20,
  },

  tripCardFooter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0000004d',
    textAlign: 'center',
    marginTop: 14,
  }
})