import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, FlatList, LayoutAnimation, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Polyline } from "react-native-maps";

const HISTORY_KEY = '@motowave:history'

export interface Trip {
  id: string;
  date: string;
  distance: number;
  cities: string[];
  route: { latitude: number, longitude: number }[];
}

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
      <View style={styles.card}>
        {/* Cabeçalho do card */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.dateText}>{new Date(item.id).toLocaleDateString()} - {new Date(item.id).toLocaleTimeString()}</Text>
            <Text style={styles.tripTitle}>
              {item.cities.length > 1 ? `${item.cities[0]} -> ${item.cities[item.cities.length - 1]}` : `Rolezinho local`}
            </Text>
          </View>
          <TouchableOpacity onPress={() => deleteTrip(item.id)}>
            <MaterialCommunityIcons name={"trash-can-outline"} size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>

        {/* Mini mapa estático */}
        <View style={styles.mapContainer}>
          {initalRegion && (
            <MapView
              style={StyleSheet.absoluteFillObject}
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

          {/* Rodapé do card */}
          <View style={styles.cardFooter}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Distância</Text>
              <Text style={styles.statValue}>{item.distance.toFixed(2)}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Cidades</Text>
              <Text style={styles.statValue}>{item.cities.length}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

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
    backgroundColor: '#f8f9fa',
    padding: 20
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
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
  }
})