import { RouteProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FlashList } from '@shopify/flash-list'
import format from "date-fns/format";
import { ptBR } from "date-fns/locale";

import { darkMapStyle } from "../styles/mapStyle";
import { CustomHeader } from "../components/CustomHeader";

import { useTripHistory } from "../hooks/useTripHistory";
import { TripHistoryItem } from "../services/tripServices";

import { theme } from "../config/theme";
import { HistorySkeleton } from "@/components/Skeletons";

import { TourGuideProvider, TourGuideZone, useTourGuideController } from 'rn-tourguide'
import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type HistoryParams = {
  History: {
    triggerTutorial?: boolean
  }
}

const HistoryContent = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<RouteProp<HistoryParams, 'History'>>()
  const { triggerTutorial } = route.params || {}

  const { history, loading, loadHistory, handleDeleteTrip} = useTripHistory()
  const { canStart, start, stop } = useTourGuideController()

  const [isListReady, setIsListReady] = useState(false)

  useFocusEffect(
    useCallback(() => {
      loadHistory()

      const initTutorial = async () => {
        const hasSeen = await AsyncStorage.getItem('HAS_SEEN_HISTORY_TUTORIAL')

        if((triggerTutorial || !hasSeen) && history.length > 0 && isListReady) {
          if (canStart) {
            setTimeout(() => {
              start(1)
              console.log('history: entrou')
              AsyncStorage.setItem('HAS_SEEN_HISTORY_TUTORIAL', 'true')
            }, 1000)
          }
        }
      }

      if (isListReady) {
        initTutorial()
      }

      return () => stop()
    }, [triggerTutorial, canStart, isListReady, history.length])
  )

  const handlePressedCard = (item: TripHistoryItem) => {
    navigation.navigate('TripDetails', {
      tripId: item.id,
      triggerTutorial: true
    })
  }

  const renderCard = ({item, index}: {item: TripHistoryItem, index: number}) => {
    const dateFormatted = format(new Date(item.created_at), "d MMM, yyy", { locale: ptBR })
    const hasStartPoint = item.start_lat && item.start_lon ? true : false;

    const cardContent = (
      <TouchableOpacity
        style={styles.cardContainer}
        activeOpacity={0.9}
        onPress={() => handlePressedCard(item)}
      >
        {/* HEADER DO CARD */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons
              name='map-check'
              size={20}
              color={theme.colors.primary}
              style={{marginRight: 8}}
            />
            <Text style={styles.cardTitle} numberOfLines={(1)}>
              {item.title || "Viagem sem nome"}
            </Text>
          </View>

          <TouchableOpacity onPress={() => handleDeleteTrip(item.id)} style={styles.deleteBtn}>
            <MaterialCommunityIcons name="trash-can-outline" size={22} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>

        {/* MAPA MINIATURA */}
        <View style={styles.mapPreviewContainer}>
          {hasStartPoint ? (
            <MapView
              provider={PROVIDER_GOOGLE}
              customMapStyle={darkMapStyle}
              style={StyleSheet.absoluteFill}
              initialRegion={{
                latitude: item.start_lat!,
                longitude: item.start_lon!,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              liteMode
              zoomEnabled={false}
              pitchEnabled={false}
              scrollEnabled={false}
            >
              <Marker
                coordinate={{ latitude: item.start_lat!, longitude: item.start_lon!}}
                pinColor={theme.colors.primary}
              />
            </MapView>
          ) : (
            <View style={styles.noMapPlaceholder}>
              <MaterialCommunityIcons name='map-marker-off' size={30} color={theme.colors.textMuted}/>
              <Text>Sem localização inicial</Text>
            </View>
          )}
        </View>

        {/* FOOTER DO CARD */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.distanceValue}>
              {item.total_distance.toFixed(1)}
              <Text style={styles.distanceUnit}> km</Text>
            </Text>
          </View>
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons
              name="calendar-blank"
              size={14}
              color={theme.colors.textSecondary}
              style={{marginRight: 8}}
            />
            <Text style={styles.dateText}>{dateFormatted}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );

    if (index === 0) {
      return (
        <TourGuideZone
          zone={1}
          text="Esta é a sua última viagem. Toque nela para ver os detalhes e compartilhar."
          borderRadius={theme.sizes.radius}
          shape="rectangle"
        >
          {cardContent}
        </TourGuideZone>
      )
    }

    return cardContent;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={theme.colors.background} />

      <CustomHeader />

      {loading && history.length === 0 ? (
        <View style={styles.centerLoading}>
          <HistorySkeleton />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
            <MaterialCommunityIcons name='road-variant' size={50} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyText}>Nenhuma viagem ainda.</Text>
          <Text style={styles.emptySubtext}>Acele e sua história aparecerá aqui.</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }} onLayout={() => setIsListReady(true)}>
          <FlashList
            data={history}
            keyExtractor={item => item.id}
            renderItem={renderCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={() => loadHistory(true)}
          />
        </View>
      )}
    </View>
  )
}

export const History = () => {
  return (
    <TourGuideProvider
      androidStatusBarVisible={true}
      backdropColor="rgba(0, 0, 0, 0.7)"
      labels={{
        previous: 'Anterior',
        next: 'Próximo',
        skip: 'Pular',
        finish: 'Ok, Entendi!'
      }}
    >
      <HistoryContent />
    </TourGuideProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
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

  // Card Style
  cardContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.sizes.radius,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    flex: 1
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.title,
    color: theme.colors.text,
    flexShrink: 1,
    letterSpacing: 0.5
  },
  deleteBtn: {
    padding: 5
  },

  // MAPA
  mapPreviewContainer: {
    height: 130,
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#222'
  },
  noMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#252525'
  },
  noMapText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 5,
    fontFamily: theme.fonts.body
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
    fontSize: 20,
    fontFamily: theme.fonts.title,
    color: theme.colors.primary,
    letterSpacing: -0.5
  },
  distanceUnit: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.primary
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    textTransform: 'uppercase'
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  emptyText: {
    fontSize: 20,
    color: theme.colors.text,
    fontFamily: theme.fonts.title
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    fontFamily: theme.fonts.title
  }
})