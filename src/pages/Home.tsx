import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useTripRecorder } from "../hooks/useTripRecorder"
import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigation } from "@react-navigation/native"
import { TripServices } from "../services/tripServices"
import { StatusBar } from "expo-status-bar"
import { theme } from "../config/theme"
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps"
import { darkMapStyle } from "../styles/mapStyle"
import { BlurView } from 'expo-blur'
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { SaveTripModal } from "../components/saveTripModal"
import { showToast } from "../utils/toast"

const { width, height } = Dimensions.get('window')

export const Home = () => {
  const {
    location, distance, route, cities, isTracking,
    toggleTracking, resetTrip
  } = useTripRecorder()

  const navigation = useNavigation();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false)

  const confirmReset = () => {
    Alert.alert("Confirmar", "Deseja realmente apagar o registro local?", [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim, Apagar', style: 'destructive', onPress: resetTrip }
    ])
  }

  const handleFinishPress = () => {
    if (isTracking) {
      showToast.info('Em movimento', 'Pause o rastreamente antes de finalizar.')
      return;
    }

    Alert.alert("Finalizar viagem", "O que deseja fazer?", [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: confirmReset },
      {
        text: 'Salvar na Nuvem',
        onPress: () => {
          if (distance < 0.05) return Alert.alert("Viagem curta", "Viagem curta demais para ser salva!");
          setShowSaveModal(true)
        }
      }
    ])
  }

  const handleConfirmSave = async (title: string) => {
    setIsSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    if(!user) {
      setIsSaving(false)
      showToast.error('Erro', 'Você precisa estar logado.')
      return supabase.auth.signOut()
    }

    const success = await TripServices.saveToCloud({
      title, distance, route, cities
    }, user.id)

    setIsSaving(false)
    if (success) {
      setShowSaveModal(false)
      resetTrip();
      showToast.success('Sucesso!', 'Sua aventura foi salva no passaporte.')
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={theme.colors.background} />

      {location ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          customMapStyle={darkMapStyle}
          showsUserLocation
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          }}
          region={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          }}
        >
          <Polyline
            coordinates={route}
            strokeColor={theme.colors.primary}
            strokeWidth={6}
          />
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <Text style={styles.loadingText}>Calibrando Satélites...</Text>
        </View>
      )}

      <View style={styles.hudWrapper}>
        <BlurView intensity={40} tint="dark" style={styles.glassContainer}>

          {/* Distância */}
          <View style={styles.hudItem}>
            <Text style={styles.hudLabel}>DISTÂNCIA</Text>
            <Text style={styles.hudValue}>
              {distance.toFixed(1)}
              <Text style={styles.hudUnit}> km</Text>
            </Text>
          </View>

          {/* Divisor NEON */}
          <View style={styles.neonDivider} />

          {/* Cidades */}
          <View style={styles.hudItem}>
            <Text style={styles.hudLabel}>CIDADES</Text>
            <Text style={styles.hudValue}>{cities.length}</Text>
          </View>
        </BlurView>
      </View>

      {/* Controles */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          activeOpacity={.8}
          style={[
            styles.mainButton,
            { backgroundColor: isTracking ? theme.colors.danger : theme.colors.primaryDark }
          ]}
          onPress={toggleTracking}
        >
          <MaterialCommunityIcons
            name={isTracking ? 'pause' : 'bike-fast'}
            size={24}
            color='#fff'
            style={{ marginRight: 8 }}
          />
          <Text style={styles.btnText}>
            {isTracking ? 'PAUSAR' : 'ACELERAR'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={.8}
          style={[styles.saveButton, isSaving && { opacity: 0.5 }]}
          onPress={handleFinishPress}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <MaterialCommunityIcons
              name="flag-checkered"
              size={24}
              color='#fff'
            />
          )}
        </TouchableOpacity>
      </View>

      <SaveTripModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleConfirmSave}
        distance={distance}
        cities={cities}
        isSaving={isSaving}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  map: {
    width: width,
    height: height + 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.body,
    marginTop: 10,
  },

  hudWrapper: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    width: '90%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.neonBorder,
    elevation: 10,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  glassContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  hudItem: {
    alignItems: 'center',
  },
  hudLabel: {
    fontSize: 10,
    color: theme.colors.primary,
    fontFamily: theme.fonts.title,
    textShadowColor: theme.colors.primaryTranslucent,
    textShadowRadius: 10,
  },
  hudValue: {
    fontSize: 32,
    color: theme.colors.text,
    fontFamily: theme.fonts.title,
    letterSpacing: 2,
    marginBottom: 4
  },
  hudUnit: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary
  },
  neonDivider: {
    width: 1,
    height: '60%',
    backgroundColor: theme.colors.primary,
    opacity: 0.5
  },

  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 35,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  saveButton: {
    backgroundColor: theme.colors.surface,
    padding: 18,
    borderRadius: 35,
    marginLeft: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  btnText: {
    color: '#fff',
    fontFamily: theme.fonts.title,
    fontSize: 16,
    letterSpacing: 1
  }
})