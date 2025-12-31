import React, { useState, useCallback } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Dimensions
} from "react-native";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { supabase } from "../lib/supabase";

import { CustomHeader } from "../components/CustomHeader";
import { PassportSkeleton } from "../components/PassportSkeleton";

// --- SISTEMA DE NÍVEIS ---
const LEVEL_SYSTEM = [
  { level: 1, title: "Garagem", minKm: 0, color: "#95a5a6" },
  { level: 2, title: "Primeira Marcha", minKm: 50, color: "#cd7f32" },
  { level: 3, title: "Rodageiro", minKm: 200, color: "#c0c0c0" },
  { level: 4, title: "Capitão de Estrada", minKm: 1000, color: "#f1c40f" },
  { level: 5, title: "Lenda do Asfalto", minKm: 5000, color: "#9b59b6" },
];

export const Passport = () => {
  const [loading, setLoading] = useState(true);

  // INICIALIZAÇÃO: null em vez de dados estáticos para evitar o "pulo"
  const [totalKm, setTotalKm] = useState<number | null>(null);
  const [citiesCount, setCitiesCount] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // Estados de Nível
  const [currentLevel, setCurrentLevel] = useState(LEVEL_SYSTEM[0]);
  const [nextLevel, setNextLevel] = useState(LEVEL_SYSTEM[1]);
  const [progress, setProgress] = useState(0);

  // --- LÓGICA DE NÍVEL ---
  const calculateLevel = (km: number) => {
    let level = LEVEL_SYSTEM[0];
    let next = LEVEL_SYSTEM[1];

    for (let i = 0; i < LEVEL_SYSTEM.length; i++) {
      if (km >= LEVEL_SYSTEM[i].minKm) {
        level = LEVEL_SYSTEM[i];
        next = LEVEL_SYSTEM[i + 1] || { minKm: 999999, title: "Lenda Viva", color: "#000", level: 99 };
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

  // --- CARREGAR DADOS ---
  const loadStats = async () => {
    // Apenas ativa o loading se não tivermos dados ainda (primeira carga)
    // Isso evita piscar a tela inteira quando damos "Refresh" puxando pra baixo
    if (totalKm === null) setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('total_km, username') // Certifique-se que username existe no seu banco
        .eq('id', user.id)
        .single();

      const { data: citiesData } = await supabase
        .from('visited_cities')
        .select('city_name')
        .eq('user_id', user.id);

      if (profile) {
        // Fallback: Se o username vier null do banco, aí sim usamos "Viajante"
        // Mas só DEPOIS de carregar
        setUsername(profile.username || "Viajante");
        setTotalKm(profile.total_km || 0);
        calculateLevel(profile.total_km || 0);
      }

      if (citiesData) {
        const uniqueCities = new Set(citiesData.map(c => c.city_name.trim().toUpperCase()));
        setCitiesCount(uniqueCities.size);
      }

    } catch (e) {
      console.error("Erro ao carregar passaporte:", e);
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
    Alert.alert("Sair", "Deseja desconectar?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: () => supabase.auth.signOut() }
    ]);
  };

  // --- RENDERIZAÇÃO CONDICIONAL ---

  // Se estiver carregando pela primeira vez (sem dados), mostra o Esqueleto
  if (loading && totalKm === null) {
    return <PassportSkeleton />;
  }

  return (
    <View style={{flex: 1, backgroundColor: '#f5f5f5'}}>
      <CustomHeader title="Meu passaporte" subtitle={currentLevel.title} />

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats}/>}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn}>
            <MaterialCommunityIcons name="logout" size={24} color="#C0392B"/>
          </TouchableOpacity>

          {/* Agora usamos username direto, pois garantimos que ele não é null aqui */}
          <Text style={styles.username}>{username}</Text>

          <View style={[styles.badgeContainer, { backgroundColor: currentLevel.color }]}>
            <Text style={styles.badgeText}>{currentLevel.title}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Nível {currentLevel.level}</Text>
            <Text style={styles.progressLabel}>Próx: {nextLevel.title}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: currentLevel.color }]} />
          </View>
          <Text style={styles.progressText}>
            Faltam {(nextLevel.minKm - (totalKm || 0)).toFixed(1)} km para subir de nível
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="map-marker-distance" size={30} color="#e67e22" />
            <Text style={styles.statValue}>{(totalKm || 0).toFixed(1)}</Text>
            <Text style={styles.statLabel}>Km Rodados</Text>
          </View>

          <View style={styles.statCard}>
            <FontAwesome5 name="city" size={24} color="#3498db" />
            <Text style={styles.statValue}>{citiesCount || 0}</Text>
            <Text style={styles.statLabel}>Cidades</Text>
          </View>
        </View>

        {/* Exemplo de Badges reativas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conquistas</Text>

          <View style={[styles.achievementRow, { opacity: (totalKm || 0) > 0 ? 1 : 0.5 }]}>
              <View style={[styles.achievementIcon, { backgroundColor: (totalKm || 0) > 0 ? "#f1c40f" : "#ccc" }]}>
                  <MaterialCommunityIcons name="flag-checkered" size={24} color="white" />
              </View>
              <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>Primeira Aventura</Text>
                  <Text style={styles.achievementDesc}>Realizou a primeira viagem com MotoWave.</Text>
              </View>
          </View>
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
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
  logoutBtn: { position: 'absolute', top: 20, right: 20, padding: 10 },
  username: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  badgeContainer: { marginTop: 10, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 },
  badgeText: { color: '#fff', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12 },

  section: { margin: 20, backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 2 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 12, color: '#666', fontWeight: '600' },
  progressBarBg: { height: 10, backgroundColor: '#eee', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  progressText: { marginTop: 10, fontSize: 12, color: '#888', textAlign: 'center' },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20 },
  statCard: { backgroundColor: '#fff', width: '48%', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 2 },
  statValue: { fontSize: 22, fontWeight: 'bold', marginVertical: 5, color: '#333' },
  statLabel: { fontSize: 12, color: '#888' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  achievementRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  achievementIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  achievementInfo: { flex: 1 },
  achievementTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  achievementDesc: { fontSize: 12, color: '#777' },
});