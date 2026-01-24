import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { RouteProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native"
import { TourGuideProvider, TourGuideZone, useTourGuideController } from "rn-tourguide";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from 'expo-linear-gradient'
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { theme } from "@/config/theme";

import { usePassport } from "@/hooks/usePassport"
import { ProfileService } from "@/services/profileService";

import { CustomHeader } from "@/components/CustomHeader";
import { PassportSkeleton } from "@/components/Skeletons";

type PassportParams = {
  Passport: {
    triggerTutorial?: boolean
  }
}

const PassportContent = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<RouteProp<PassportParams, 'Passport'>>()
  const { triggerTutorial } = route.params || {}
  const { canStart, start, stop } = useTourGuideController()

  const {
    loading, username, totalKm, citiesCount,
    currentLevel, nextLevel, badges, progress,
    loadStats
  } = usePassport()

  const [avatar, setAvatar] = useState('account')
  const [bio, setBio] = useState('');

  const [isUIReady, setIsUIReady] = useState(false)

  useEffect(() => {
    if(isUIReady && canStart) {
      const initTutorial = async () => {
        const hasSeen = await AsyncStorage.getItem('HAS_SEEN_PASSPORT_TUTORIAL')

        if (triggerTutorial && !hasSeen) {
          setTimeout(() => {
            start(1)
            AsyncStorage.setItem('HAS_SEEN_PASSPORT_TUTORIAL', 'true')
          }, 1000)
        }
      }

      initTutorial()
    }
  }, [isUIReady, canStart, triggerTutorial])

  useFocusEffect(
    useCallback(() => {
      fetchProfileIdentify()

      setIsUIReady(false)

      return () => { stop() }
    }, [triggerTutorial, canStart])
  )

  const fetchProfileIdentify = async () => {
    try {
      const profile = await ProfileService.getProfile()
      if(profile) {
        setAvatar(profile.avatar_slug || 'account')
        setBio(profile.bio || '')
      }
    } catch (error) {
      console.log("Erro ao carregar avatar", error)
    }
  }

  if (loading && totalKm === 0) return <PassportSkeleton />

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#121212" translucent />
      <CustomHeader />

      <ScrollView
        contentContainerStyle={{paddingBottom: 40}}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => { loadStats(), fetchProfileIdentify() }}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header do Perfil */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.configBtn}>
            <Ionicons name="settings-outline" size={24} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={[currentLevel.color, theme.colors.surface]}
              style={styles.avatarBorder}
            >
              <View style={styles.avatarContainer}>
                <MaterialCommunityIcons name={avatar as any} size={60} color="#fff" />
              </View>
            </LinearGradient>

            <View style={[styles.levelBadge, { backgroundColor: currentLevel.color}]}>
              <Text style={styles.levelBadgeText}>{currentLevel.level_number}</Text>
            </View>

          </View>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.userTitle}>{currentLevel.title}</Text>

            {!!bio && (
              <Text style={styles.userBio}>"{bio}"</Text>
            )}
        </View>

        {/* Barra de XP */}
        <View
          onLayout={() => {
            if (!isUIReady) setIsUIReady(true)
          }}
        >
          <TourGuideZone
            zone={1}
            text="Acompanhe aqui o seu progresso para o próximo nível!"
            borderRadius={12}
            keepTooltipPosition={true}
          >
            <View style={styles.xpContainer}>
              <View style={styles.xpHeader}>
                <Text style={[styles.xpText, { fontFamily: theme.fonts.bold }]}>Nível {currentLevel.level_number}</Text>
                <Text style={styles.xpText}>
                  {totalKm.toFixed(1)} / {nextLevel.min_km} km
                </Text>
              </View>
              <View style={styles.xpBarBg}>
                <LinearGradient
                  colors={[currentLevel.color, theme.colors.primary]}
                  start={{ x: 0, y: 0}}
                  end={{ x: 1, y: 0}}
                  style={[styles.xpBarFill, { width: `${progress * 100}%` }]}
                />
              </View>
              <Text style={styles.xpNextText}>
                Faltam {(nextLevel.min_km - totalKm).toFixed(1)} km para {nextLevel.title}
              </Text>
            </View>
          </TourGuideZone>
        </View>

        {/* Estatísticas */}
        <TourGuideZone
          zone={2}
          text="Aqui estão suas estatísticas globais"
          borderRadius={12}
          style={{ flex:1 }}
        >
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={[styles.iconBox, {backgroundColor: theme.colors.primaryTranslucent}]}>
                <MaterialCommunityIcons name="map-marker-distance" size={24} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.statValue}>{totalKm.toFixed(1)}</Text>
                <Text style={styles.statLabel}>KM Rodados</Text>
              </View>
            </View>

            <TourGuideZone
              zone={3}
              text="Clicando aqui você verá no mapa todas as cidades que visitou!"
              borderRadius={16}
              style={styles.statCard}
            >
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => navigation.navigate('Cities')}
                style={{ flexDirection: 'row' }}
              >
                <View style={[styles.iconBox, { backgroundColor: 'rgba(52, 152, 219, 0.15)' }]}>
                  <FontAwesome5 name="city" size={20} color={theme.colors.info}/>
                </View>
                <View>
                  <Text style={styles.statValue}>{citiesCount}</Text>
                  <Text style={styles.statLabel}>Cidades</Text>
                </View>
              </TouchableOpacity>

            </TourGuideZone>
          </View>
        </TourGuideZone>

        {/* Galeria de Conquistas */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Conquistas</Text>
            {/* <Text style={styles.seeAllText}>Ver Todas</Text> */}
          </View>

          <View style={styles.badgeRow}>
            {badges.map((badge) => (
              <View
                key={badge.id}
                style={[
                  styles.badgeItem,
                  badge.unlocked && styles.badgeUnlocked
                ]}
              >
                <MaterialCommunityIcons
                  name={badge.icon as any}
                  size={28}
                  color={badge.unlocked ? badge.color : '#555'}
                />
                <Text style={styles.badgeLabel}>{badge.name}</Text>
                <Text style={styles.badgeCrit}>{badge.criteria_value} {badge.criteria_type === 'distance' ? 'km' : 'Cidades'}</Text>
              </View>

            ))}
          </View>

        </View>

        <View style={{height: 20}} />
      </ScrollView>
    </View>
  )
}

export const Passport = () => {
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
      <PassportContent />
    </TourGuideProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 30
  },
  configBtn: {
    position: 'absolute',
    top: 16,
    right: 24,
    zIndex: 10,
    padding: 5
  },
  avatarWrapper: {
    marginBottom: 15
  },
  avatarBorder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarContainer: {
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center'
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.background
  },
  levelBadgeText: {
    color: '#fff',
    fontFamily: theme.fonts.bold,
    fontSize: 14,
  },

  username: {
    fontSize: 26,
    fontFamily: theme.fonts.title,
    color: theme.colors.text,
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  userTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.subtitle,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  userBio: {
    fontSize: 12,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
    maxWidth: '70%'
  },

  xpContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },

  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  xpText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontFamily: theme.fonts.body,
  },
  xpBarBg: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpNextText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: theme.fonts.body
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 30,
    justifyContent: 'space-between'
  },
  statCard: {
    flex: 0.48,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 20,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body
  },
  section: {
    marginHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: 15,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
  },
  badgeItem: {
    width: '31%',
    aspectRatio: 0.9,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 10,backgroundColor: '#181818',
    borderColor: '#222',
    opacity: 0.6
  },
  badgeUnlocked: {
    backgroundColor: theme.colors.surface,
    borderColor: '#333',
    opacity: 1,
  },
  badgeLabel: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    marginTop: 8,
    fontFamily: theme.fonts.subtitle
  },
  badgeCrit: {
    color: '#fff',
    fontSize: 10,
    fontFamily: theme.fonts.body
  },
})