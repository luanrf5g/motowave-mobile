import { StatusBar } from "expo-status-bar"
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useCityMap } from "../hooks/useCityMap"
import { theme } from "../config/theme"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import { darkMapStyle } from "../styles/mapStyle"
import { MaterialCommunityIcons } from "@expo/vector-icons"

export const Cities = () => {
  const { cities, loading, mapRef, navigation } = useCityMap()

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando mapa de conquistas...</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          customMapStyle={darkMapStyle}
          initialRegion={{
            latitude: -14.2350,
            longitude: -51.9253,
            latitudeDelta: 25,
            longitudeDelta: 25,
          }}
        >
          {cities.map((city, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: city.lat, longitude: city.lon }}
              title={city.city_name}
              description={city.state}
            >
              <View style={styles.markerContainer}>
                <MaterialCommunityIcons
                  name="map-marker-star"
                  size={32}
                  color={theme.colors.primary}
                />
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color='#fff' />
      </TouchableOpacity>

      {!loading && (
        <View style={styles.counterBadge}>
          <MaterialCommunityIcons name="city-variant-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.counterText}>
            {cities.length} {cities.length === 1 ? 'Cidade' : 'Cidades'}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 15,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body
  },
  map: {
    flex: 1,
  },

  // Marcador
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Botão Voltar
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: theme.colors.border,
    zIndex: 10
  },

  // Badge Contador
  counterBadge: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    elevation: 5,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  counterText: {
    color: '#FFF',
    fontFamily: theme.fonts.title,
    marginLeft: 8,
    fontSize: 14
  }
});