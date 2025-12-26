import { FontAwesome, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { supabase } from "../lib/supabase";

const GLOBAL_STATS_KEY = '@motowave:global_stats'

interface Cities {
  name: string,
  latitude: number,
  longitude: number
}
interface GlobalStats {
  totalKm: number,
  allCities: Cities[]
}

const LEVEL_SYSTEM = [
  { level: 1, title: "Garagem", minKm: 0, color: "#95a5a6" },
  { level: 2, title: "Primeira Marcha", minKm: 50, color: "#f1c40f" }, // Bronze
  { level: 3, title: "Rodageiro", minKm: 200, color: "#e67e22" },      // Prata
  { level: 4, title: "Capitão de Estrada", minKm: 1000, color: "#3498db" }, // Ouro
  { level: 5, title: "Lenda do Asfalto", minKm: 5000, color: "#9b59b6" },  // Diamante
];

export const Passport = () => {
  const [totalKm, setTotalKm] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(LEVEL_SYSTEM[0])
  const [nextLevel, setNextLevel] = useState(LEVEL_SYSTEM[1])
  const [progress, setProgress] = useState(0)
  const [citiesCount, setCitiesCount] = useState(0)

  const calculateLevel = (km: number) => {
    let level = LEVEL_SYSTEM[0]
    let next = LEVEL_SYSTEM[1]

    for(let i = 0; i < LEVEL_SYSTEM.length; i++) {
      if(km >= LEVEL_SYSTEM[i].minKm) {
        level = LEVEL_SYSTEM[i]
        next = LEVEL_SYSTEM[i + 1] || { minKm: 999999, title: "Max Level"}
      }
    }

    setCurrentLevel(level)
    setNextLevel(next)

    if(next.minKm < 999999) {
      const range = next.minKm - level.minKm;
      const currentInRang = km - level.minKm
      const percent = (currentInRang / range)
      setProgress(percent > 1 ? 1 : percent);
    } else {
      setProgress(1)
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadStats = async () => {
        setLoading(true)
        try {
          const globalStatsJson = await AsyncStorage.getItem(GLOBAL_STATS_KEY)
          const globalStats: GlobalStats = globalStatsJson
            ? JSON.parse(globalStatsJson)
            : { totalKm: 0, allCities: []}

          setTotalKm(globalStats.totalKm)
          calculateLevel(totalKm)
          setCitiesCount(globalStats.allCities.length)
        } catch (e) {
          console.error("Erro ao ler passaporte", e)
        } finally {
          setLoading(false)
        }
      }

      loadStats();
    }, [])
  )

  async function handleSignOut() {
    Alert.alert(
      "Sair da Conta",
      "Tem certeza que deseja sair da sua conta?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            const {error} = await supabase.auth.signOut()

            if(error) {
              Alert.alert("Erro ao sair", error.message)
            }
          }
        }
      ]
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho do Perfil */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSignOut} style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: '#ff000030',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <MaterialCommunityIcons name="power" size={24} color="#ff0000"/>
        </TouchableOpacity>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account-circle" size={80} color= "#333" />
        </View>
        <Text style={styles.username}>Viajante Solo</Text>
        <View style={[styles.badgeContainer, {backgroundColor: currentLevel.color}]}>
          <Text style={styles.badgeText}>{currentLevel.title}</Text>
        </View>
      </View>

      {/* Barra de Progresso */}
      <View style={styles.section}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Nível: {currentLevel.level}</Text>
          <Text style={styles.progressLabel}>Próx: {nextLevel.title}</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, {width: `${progress * 100}%`, backgroundColor: currentLevel.color}]}/>
        </View>
        <Text style={styles.progressText}>
          Faltam {(nextLevel.minKm - totalKm).toFixed(1)} km para subir de nível
        </Text>
      </View>

      {/* Grid de Estatísticas */}
      <View style={styles.statsGrid}>
        {/* Card KM */}
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="map-marker-distance" size={30} color="#e67e22" />
          <Text style={styles.statValue}>{totalKm.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Km Rodados</Text>
        </View>

        {/*  Card Cidades (Placeholder) */}
        <View style={styles.statCard}>
          <FontAwesome5 name="city" size={24} color="#3498db" />
          <Text style={styles.statValue}>{citiesCount}</Text>
          <Text style={styles.statLabel}>Cidades</Text>
        </View>
      </View>

      {/* Troféus / Conquistas (Estático por enquanto) */}

      {/*
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conquistas Recentes</Text>

          Exemplo de badge Desbloqueada
          <View style={styles.achievementRow}>
            <View style={[styles.achievementIcon, {backgroundColor: "#f1c40f"}]}>
              <MaterialCommunityIcons name="star" size={24} color="white" />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>Primeira Aventura</Text>
              <Text style={styles.achievementDesc}>Instalou o MotoWave</Text>
            </View>
          </View>

          Exemplo de Badge Bloqueada
          <View style={[styles.achievementRow, { opacity: 0.5 }]}>
            <View style={[styles.achievementIcon, {backgroundColor: '#ccc'}]}>
              <MaterialCommunityIcons name="lock" size={24} color="white" />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>Iron Butt</Text>
              <Text style={styles.achievementDesc}>Rode 500km em um dia</Text>
            </View>
          </View>
        </View>
        <View style={{height: 40}} />

      */}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarContainer: { marginBottom: 10 },
  username: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  badgeContainer: {
    marginTop: 10, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20
  },
  badgeText: { color: '#fff', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12 },

  section: {
    margin: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 2,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 12, color: '#666', fontWeight: '600' },
  progressBarBg: { height: 10, backgroundColor: '#eee', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  progressText: { marginTop: 10, fontSize: 12, color: '#888', textAlign: 'center' },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20 },
  statCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: 'bold', marginVertical: 5, color: '#333' },
  statLabel: { fontSize: 12, color: '#888' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  achievementRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  achievementIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  achievementInfo: { flex: 1 },
  achievementTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  achievementDesc: { fontSize: 12, color: '#777' },
});