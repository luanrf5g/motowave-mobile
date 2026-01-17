import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { usePassport } from "../hooks/usePassport"
import { theme } from "../config/theme";
import { StatusBar } from "expo-status-bar";
import { CustomHeader } from "../components/CustomHeader";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient'
import { useCallback, useState } from "react";
import { PassportSkeleton } from "@/components/Skeletons";
import { ProfileService } from "@/services/profileService";

export const Passport = () => {
  const navigation = useNavigation<any>()

  const {
    loading, username, totalKm, citiesCount,
    currentLevel, nextLevel, progress,
    loadStats
  } = usePassport()

  const [avatar, setAvatar] = useState('account')
  const [bio, setBio] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchProfileIdentify()
    }, [])
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
              <Text style={styles.levelBadgeText}>{currentLevel.level}</Text>
            </View>

          </View>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.userTitle}>{currentLevel.title}</Text>

            {!!bio && (
              <Text style={styles.userBio}>"{bio}"</Text>
            )}
        </View>

        {/* Barra de XP */}
        <View style={styles.xpContainer}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpText}>Nível {currentLevel.level}</Text>
            <Text style={styles.xpText}>
              {totalKm.toFixed(1)} / {nextLevel.minKm} km
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
            Faltam {(nextLevel.minKm - totalKm).toFixed(1)} km para {nextLevel.title}
          </Text>
        </View>

        {/* Estatísticas */}
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

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => navigation.navigate('Cities')}
            style={styles.statCard}
          >
            <View style={[styles.iconBox, { backgroundColor: 'rgba(52, 152, 219, 0.15)' }]}>
              <FontAwesome5 name="city" size={20} color={theme.colors.info}/>
            </View>
            <View>
              <Text style={styles.statValue}>{citiesCount}</Text>
              <Text style={styles.statLabel}>Cidades</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Galeria de Conquistas */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Conquistas</Text>
            {/* <Text style={styles.seeAllText}>Ver Todas</Text> */}
          </View>

          <View style={styles.badgeRow}>
            {/* Badge 1: Start */}
            <View style={[styles.badgeItem, totalKm > 0 ? styles.badgeUnlocked : styles.badgeLocked]}>
              <MaterialCommunityIcons
                name="flag-checkered"
                size={28}
                color={totalKm > 0 ? '#f1c40f' : '#555'}
              />
              <Text style={styles.badgeLabel}>Start</Text>
            </View>

            {/* Badge 2: Explorador */}
            <View style={[styles.badgeItem, citiesCount >= 5 ? styles.badgeUnlocked : styles.badgeLocked]}>
              <MaterialCommunityIcons
                name="flag-checkered"
                size={28}
                color={citiesCount >= 5 ? theme.colors.info : '#555'}
              />
              <Text style={styles.badgeLabel}>Explorador</Text>
            </View>

            {/* Badge 3: Iron Butt */}
            <View style={[styles.badgeItem, totalKm >= 500 ? styles.badgeUnlocked : styles.badgeLocked]}>
              <MaterialCommunityIcons
                name="flag-checkered"
                size={28}
                color={totalKm >= 500 ? '#9b59b6' : '#555'}
              />
              <Text style={styles.badgeLabel}>Iron Butt</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
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
    fontFamily: theme.fonts.title,
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
    fontFamily: theme.fonts.title,
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
    fontFamily: theme.fonts.title,
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
    fontFamily: theme.fonts.title
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
    fontFamily: theme.fonts.title,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.title
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
    fontFamily: theme.fonts.title,
    color: theme.colors.text
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  badgeItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  badgeUnlocked: {
    backgroundColor: theme.colors.surface,
    borderColor: '#333'
  },
  badgeLocked: {
    backgroundColor: '#181818',
    borderColor: '#222',
    opacity: 0.6
  },
  badgeLabel: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    marginTop: 8,
    fontFamily: theme.fonts.subtitle
  }
})