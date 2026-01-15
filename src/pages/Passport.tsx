import React, { useState, useCallback } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Image,
  Dimensions
} from "react-native";
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient'; // <--- NOVO
import { supabase } from "../lib/supabase";
import { CustomHeader } from "../components/CustomHeader";

// --- SISTEMA DE NÍVEIS (Mantido) ---
const LEVEL_SYSTEM = [
  { level: 1, title: "Garagem", minKm: 0, color: "#7f8c8d" }, // Cinza
  { level: 2, title: "Primeira Marcha", minKm: 50, color: "#cd7f32" }, // Bronze
  { level: 3, title: "Rodageiro", minKm: 200, color: "#bdc3c7" },      // Prata
  { level: 4, title: "Capitão de Estrada", minKm: 1000, color: "#f1c40f" }, // Ouro
  { level: 5, title: "Lenda do Asfalto", minKm: 5000, color: "#9b59b6" },  // Diamante
];

// --- SKELETON DARK (Atualizado para o tema escuro) ---
const PassportSkeleton = () => (
  <View style={[styles.container, { paddingTop: 60 }]}>
    <View style={{ alignItems: 'center', marginBottom: 30 }}>
      <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#333', marginBottom: 15 }} />
      <View style={{ width: 180, height: 28, backgroundColor: '#333', borderRadius: 6, marginBottom: 10 }} />
      <View style={{ width: 120, height: 24, backgroundColor: '#333', borderRadius: 12 }} />
    </View>
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: '#1E1E1E' }]} />
      <View style={[styles.statCard, { backgroundColor: '#1E1E1E' }]} />
    </View>
  </View>
);

export const Passport = () => {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [totalKm, setTotalKm] = useState<number | null>(null);
  const [citiesCount, setCitiesCount] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const [currentLevel, setCurrentLevel] = useState(LEVEL_SYSTEM[0]);
  const [nextLevel, setNextLevel] = useState(LEVEL_SYSTEM[1]);
  const [progress, setProgress] = useState(0);

  // --- LÓGICA DE CÁLCULO E LOAD (MANTIDA IGUAL) ---
  const calculateLevel = (km: number) => {
    let level = LEVEL_SYSTEM[0];
    let next = LEVEL_SYSTEM[1];

    for (let i = 0; i < LEVEL_SYSTEM.length; i++) {
      if (km >= LEVEL_SYSTEM[i].minKm) {
        level = LEVEL_SYSTEM[i];
        next = LEVEL_SYSTEM[i + 1] || { minKm: 999999, title: "Lenda Viva", color: "#fff", level: 99 };
      }
    }
    setCurrentLevel(level);
    setNextLevel(next);

    if (next.minKm < 999999) {
      const range = next.minKm - level.minKm;
      const currentInRange = km - level.minKm;
      const percent = currentInRange / range;
      setProgress(percent > 1 ? 1 : percent);
    } else {
      setProgress(1);
    }
  };

  const loadStats = async () => {
    if (totalKm === null) setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('total_km, username')
        .eq('id', user.id)
        .single();

      const { data: citiesData } = await supabase
        .from('visited_cities')
        .select('city_name')
        .eq('user_id', user.id);

      if (profile) {
        setUsername(profile.username || "Viajante");
        setTotalKm(profile.total_km || 0);
        calculateLevel(profile.total_km || 0);
      }

      if (citiesData) {
        const uniqueCities = new Set(citiesData.map(c => c.city_name.trim().toUpperCase()));
        setCitiesCount(uniqueCities.size);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const handleSignOut = async () => {
    Alert.alert("Desconectar", "Tem certeza que deseja sair?", [
        { text: "Ficar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: () => supabase.auth.signOut() }
    ]);
  };

  if (loading && totalKm === null) return <PassportSkeleton />;

  return (
    <View style={styles.container}>
      <CustomHeader showNotification/>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} tintColor="#27AE60" />}
      >
        {/* HEADER DE PERFIL */}
        <View style={styles.header}>
          {/* Botão de Config/Logout no topo direito */}
          <TouchableOpacity onPress={handleSignOut} style={styles.configBtn}>
             <Ionicons name="power" size={24} color="#aaa" />
          </TouchableOpacity>

          {/* Avatar com Borda de Progresso Visual */}
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={[currentLevel.color, '#2C3E50']}
              style={styles.avatarBorder}
            >
              <View style={styles.avatarContainer}>
                 <MaterialCommunityIcons name="account" size={60} color="#fff" />
              </View>
            </LinearGradient>
            {/* Badge de Nível Flutuante */}
            <View style={[styles.levelBadge, { backgroundColor: currentLevel.color }]}>
               <Text style={styles.levelBadgeText}>{currentLevel.level}</Text>
            </View>
          </View>

          <Text style={styles.username}>{username}</Text>
          <Text style={styles.userTitle}>{currentLevel.title}</Text>
        </View>

        {/* BARRA DE XP (Nível) */}
        <View style={styles.xpContainer}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpText}>Nível {currentLevel.level}</Text>
            <Text style={styles.xpText}>
              {(totalKm || 0).toFixed(1)} / {nextLevel.minKm} km
            </Text>
          </View>
          <View style={styles.xpBarBg}>
            <LinearGradient
              colors={[currentLevel.color, '#27AE60']} // Gradiente da cor do nível para verde
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.xpBarFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.xpNextText}>
            Faltam {(nextLevel.minKm - (totalKm || 0)).toFixed(1)} km para {nextLevel.title}
          </Text>
        </View>

        {/* ESTATÍSTICAS (Cards Pretos) */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(39, 174, 96, 0.15)' }]}>
              <MaterialCommunityIcons name="map-marker-distance" size={24} color="#27AE60" />
            </View>
            <View>
              <Text style={styles.statValue}>{(totalKm || 0).toFixed(1)}</Text>
              <Text style={styles.statLabel}>KM Rodados</Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={.6} onPress={() => navigation.navigate('Cities')} style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(41, 128, 185, 0.15)' }]}>
              <FontAwesome5 name="city" size={20} color="#3498db" />
            </View>
            <View>
              <Text style={styles.statValue}>{citiesCount || 0}</Text>
              <Text style={styles.statLabel}>Cidades</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* GALERIA DE CONQUISTAS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Conquistas</Text>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </View>

          {/* Badge 1: Primeira Viagem */}
          <View style={styles.badgeRow}>
            <View style={[styles.badgeItem, (totalKm || 0) > 0 ? styles.badgeUnlocked : styles.badgeLocked]}>
               <MaterialCommunityIcons name="flag-checkered" size={28} color={(totalKm || 0) > 0 ? "#f1c40f" : "#555"} />
               <Text style={styles.badgeLabel}>Start</Text>
            </View>

            {/* Badge 2: Explorador (5 Cidades) */}
            <View style={[styles.badgeItem, (citiesCount || 0) >= 5 ? styles.badgeUnlocked : styles.badgeLocked]}>
               <MaterialCommunityIcons name="compass-outline" size={28} color={(citiesCount || 0) >= 5 ? "#3498db" : "#555"} />
               <Text style={styles.badgeLabel}>Explorador</Text>
            </View>

            {/* Badge 3: Iron Butt (500km) - Exemplo */}
            <View style={[styles.badgeItem, (totalKm || 0) >= 500 ? styles.badgeUnlocked : styles.badgeLocked]}>
               <MaterialCommunityIcons name="trophy-outline" size={28} color={(totalKm || 0) >= 500 ? "#9b59b6" : "#555"} />
               <Text style={styles.badgeLabel}>Iron Butt</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Fundo Dark Profundo
  },
  header: {
    alignItems: 'center',
    paddingTop: 24, // Espaço para Status Bar
    paddingBottom: 30,
  },
  configBtn: {
    position: 'absolute',
    top: 50,
    right: 25,
    zIndex: 10,
    padding: 5
  },

  // Avatar Styles
  avatarWrapper: {
    marginBottom: 15,
    position: 'relative',
  },
  avatarBorder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: '#1A1A1A', // Fundo do avatar para separar da borda
    justifyContent: 'center',
    alignItems: 'center',
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
    borderColor: '#121212', // Borda da cor do fundo para "cortar" o avatar
  },
  levelBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Texto Header
  username: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    letterSpacing: 0.5
  },
  userTitle: {
    fontSize: 14,
    color: '#27AE60', // Verde destaque
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 1
  },

  // Barra de XP
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
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
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
    color: '#666',
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },

  // Grid Stats
  statsContainer: {
    flexDirection: 'row',
    gap: 15, // Gap funciona nas versões novas do RN. Se der erro, use margin
    marginHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
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
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },

  // Conquistas
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
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAllText: {
    color: '#27AE60',
    fontSize: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeItem: {
    width: '30%',
    aspectRatio: 1, // Quadrado
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  badgeUnlocked: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  badgeLocked: {
    backgroundColor: '#181818',
    borderColor: '#222',
    opacity: 0.6
  },
  badgeLabel: {
    color: '#aaa',
    fontSize: 10,
    marginTop: 8,
    fontWeight: '500'
  }
});