import React, { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Keyboard, KeyboardAvoidingView, Platform } from "react-native"
import { StatusBar } from "expo-status-bar"
import MapView, {Polyline, Marker, PROVIDER_GOOGLE} from "react-native-maps"
import { MaterialCommunityIcons, FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { TripShareModal } from "@/components/TripShareModal"
import { useTripDetails } from "../hooks/useTripDetails"
import { darkMapStyle } from "../styles/mapStyle"
import { theme } from "../config/theme"
import { showToast } from "@/utils/toast"
import { TripServices } from "@/services/tripServices"

export const TripDetails = () => {
  const { trip, loading, navigation } = useTripDetails()
  const [showShare, setShowShare] = useState(false)
  const mapRef = useRef<MapView>(null);

  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [savingTitle, setSavingTitle] = useState(false)

  const focusMap = (editingMode = false) => {
    const bottomPadding = editingMode ? 450 : 250;

    if (mapRef.current && trip?.route_coords && trip?.route_coords.length > 0) {
      mapRef.current.fitToCoordinates(trip.route_coords, {
        edgePadding: {
          top: 100,
          right: 50,
          bottom: bottomPadding,
          left: 50
        },
        animated: true
      });
    }
  }

  useEffect(() => {
    if(trip) {
      setEditedTitle(trip.title)

      const timer = setTimeout(() => {
        focusMap(isEditing)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [isEditing, trip])

  if(loading || !trip) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={theme.colors.primary}/>
        <Text style={styles.loadingText}>Carregando telemetria...</Text>
      </View>
    )
  }

  const handleSaveTitle = async () => {
    if (!editedTitle.trim()) {
      showToast.info("Ops", "O título não pode ficar vazio")
      return
    }

    setSavingTitle(true)
    try {
      await TripServices.updateTrip(trip.id, { title: editedTitle })

      trip.title = editedTitle;

      setIsEditing(false)
    } catch (error) {
      showToast.error("Erro", "Não foi possível atualizar o título.")
    } finally {
      setSavingTitle(false)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        customMapStyle={darkMapStyle}
        initialRegion={{
          latitude: trip.route_coords[0]?.latitude || -23.55,
          longitude: trip.route_coords[0]?.longitude || -46.63,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        }}
      >
        <Polyline
          coordinates={trip.route_coords}
          strokeColor={theme.colors.primary}
          strokeWidth={4}
          lineDashPattern={[0]}
        />

        {trip.route_coords.length > 0 && (
          <Marker coordinate={trip.route_coords[0]} title="Início">
            <MaterialCommunityIcons name="flag-variant" size={30} color={theme.colors.primary} />
          </Marker>
        )}

        {trip.cities.map((city, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: city.latitude, longitude: city.longitude}}
            title={city.name}
          >
            <View style={styles.cityMarker}>
              <FontAwesome5 name="city" size={10} color="#fff" />
            </View>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.infoCard}>
          <View style={styles.dragHandle}/>

          <View style={styles.headerRow}>
            <View style={{flex: 1}}>
              {isEditing ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.titleInput}
                    value={editedTitle}
                    onChangeText={setEditedTitle}
                    autoFocus
                    maxLength={30}
                  />
                  <TouchableOpacity onPress={handleSaveTitle} disabled={savingTitle} style={styles.actionBtn}>
                    {savingTitle ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <MaterialCommunityIcons name="check" size={24} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.actionBtn}>
                    <MaterialCommunityIcons name='close' size={24} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              ): (
                <TouchableOpacity
                  style={styles.titleWrapper}
                  onPress={() => setIsEditing(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tripTitle}>{trip.title || "Sem Título"}</Text>
                  <MaterialCommunityIcons name="pencil-outline" size={19} color='#666' style={{marginLeft: 10}} />
                </TouchableOpacity>
              )}
              <Text style={styles.tripDate}>
                {format(new Date(trip.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </Text>
            </View>
            <View style={styles.idBadge}>
              <Text style={styles.idText}>ID: {trip.cities.length > 0 ? 'EXP' : 'RIDE'}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.primaryTranslucent }]}>
                <MaterialCommunityIcons name="map-marker-distance" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.statValue}>
                  {trip.total_distance.toFixed(1)}
                  <Text style={styles.statUnit}> km</Text>
                </Text>
                <Text style={styles.statLabel}>
                  Distância
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(52, 152, 219, 0.2)' }]}>
                <FontAwesome5 name="map-marked-alt" size={16} color={theme.colors.info} />
              </View>
              <View>
                <Text style={styles.statValue}>{trip.cities.length}</Text>
                <Text style={styles.statLabel}>Cidades</Text>
              </View>
            </View>
          </View>

          {trip.cities.length > 0 && (
            <View style={styles.routeSection}>
              <Text style={styles.sectionHeader}>ROTEIRO DE CIDADES</Text>
              <Text style={styles.cityList}>
                {trip.cities.map(c => c.name).join('  •  ')}
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      <TouchableOpacity style={styles.fabShare} onPress={() => setShowShare(true)}>
        <MaterialCommunityIcons name="share-variant" size={24} color="#fff" />
      </TouchableOpacity>

      <TripShareModal
        visible={showShare}
        onClose={() => setShowShare(false)}
        trip={trip}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background
  },
  loadingText: {
    color: theme.colors.textMuted,
    marginTop: 10,
    fontFamily: theme.fonts.body
  },

  // Mapa Styles
  cityMarker: {
    backgroundColor: theme.colors.info,
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4
  },

  // UI Flutuante
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

  keyboardAvoidingContainer: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    zIndex: 10
  },

  // Card Inferior
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
    opacity: 0.5
  },

  // Header do Card
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.title,
    color: theme.colors.text,
    marginBottom: 4,
    letterSpacing: 0.5
  },
  tripDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    textTransform: 'uppercase'
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  titleInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: theme.fonts.title,
    color: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    paddingVertical: 0,
    marginRight: 10,
  },
  actionBtn: {
    padding: 5,
    marginLeft: 5
  },
  idBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  idText: {
    color: '#aaa',
    fontSize: 10,
    fontFamily: theme.fonts.title
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  statValue: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: theme.colors.text,
  },
  statUnit: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    marginTop: 2
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#333',
    marginHorizontal: 15
  },

  // Lista de Cidades
  routeSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingTop: 15
  },
  sectionHeader: {
    fontSize: 10,
    fontFamily: theme.fonts.title,
    color: theme.colors.textMuted,
    marginBottom: 8,
    letterSpacing: 1
  },
  cityList: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    lineHeight: 20
  },
  fabShare: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    zIndex: 999
  }
});