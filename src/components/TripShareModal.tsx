import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import ViewShot from "react-native-view-shot";
import * as Sharing from 'expo-sharing';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

import { theme } from '../config/theme';
import { darkMapStyle } from '../styles/mapStyle';
import { ProfileService } from '../services/profileService';
import { showToast } from '@/utils/toast';

const { width } = Dimensions.get('window');

// Interface exata que você forneceu
export interface TripFullDetail {
  id: string;
  title: string;
  total_distance: number;
  created_at: string;
  route_coords: { latitude: number; longitude: number }[];
  cities: { name: string; latitude: number; longitude: number }[];
}

interface TripShareModalProps {
  visible: boolean;
  onClose: () => void;
  trip: TripFullDetail | null;
}

export const TripShareModal = ({ visible, onClose, trip }: TripShareModalProps) => {
  // Refs
  const viewShotRef = useRef<any>(null);
  const mapRef = useRef<MapView>(null);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [customTitle, setCustomTitle] = useState("");

  // Estados de Usuário
  const [userProfile, setUserProfile] = useState({ username: "Piloto", avatar: "account" });

  useEffect(() => {
    if (visible && trip) {
      setCustomTitle(trip.title || "Rolê de Moto");
      loadUserProfile();

      // Centraliza o mapa na rota com um pequeno delay para garantir renderização
      if (trip.route_coords.length > 0) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(trip.route_coords, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: false
          });
        }, 500);
      }
    }
  }, [visible, trip]);

  const loadUserProfile = async () => {
    const profile = await ProfileService.getProfile();
    if (profile) {
      setUserProfile({
        username: profile.username || "Piloto",
        avatar: profile.avatar_slug || "racing-helmet"
      });
    }
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      // Pequeno delay para garantir que o mapa esteja renderizado
      await new Promise(resolve => setTimeout(resolve, 800));

      const uri = await viewShotRef.current.capture();

      if (!(await Sharing.isAvailableAsync())) {
        showToast.error("Erro", "Compartilhamento indisponível.");
        return;
      }
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.log(error);
      showToast.error("Erro", "Falha ao gerar a imagem.");
    } finally {
      setLoading(false);
    }
  };

  // Se não tiver trip, não renderiza nada
  if (!trip) return null;

  // Helpers de Dados baseados na interface TripFullDetail
  const cityListNames = trip.cities.map(c => c.name);
  const startCity = cityListNames[0] || "Origem";
  const endCity = cityListNames[cityListNames.length - 1] || "Destino";
  const citiesCount = trip.cities.length;
  const formattedDate = new Date(trip.created_at).toLocaleDateString('pt-BR');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>

        {/* Header Controls */}
        <View style={styles.headerControls}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CRIAR STORIES</Text>
          <View style={{width: 40}} />
        </View>

        {/* Input de Título */}
        <View style={styles.editContainer}>
          <Text style={styles.editLabel}>Título da História:</Text>
          <TextInput
            style={styles.input}
            value={customTitle}
            onChangeText={setCustomTitle}
            maxLength={30}
            placeholder="Ex: Serra do Rio do Rastro"
            placeholderTextColor="#666"
          />
        </View>

        {/* --- O CARD (ÁREA DE CAPTURA) --- */}
        <View style={styles.cardWrapper}>
          <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1.0 }} style={{ backgroundColor: '#121212' }}>
            <View style={styles.card}>

              {/* 1. MAPA BACKGROUND */}
              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                customMapStyle={darkMapStyle}
                style={StyleSheet.absoluteFill}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                {trip.route_coords.length > 0 && (
                  <Polyline
                    coordinates={trip.route_coords}
                    strokeWidth={5}
                    strokeColor="#27AE60" // Verde Neon Solicitado
                  />
                )}
              </MapView>

              {/* 2. OVERLAY GLASS (Fundo Escuro Transparente) */}
              <LinearGradient
                colors={['rgba(18,18,18,0.3)', 'rgba(18,18,18,0.85)', '#121212']}
                style={[StyleSheet.absoluteFill, { borderWidth: 1, borderColor: '#121212' }]}
                locations={[0, 0.6, 1]}
              />

              {/* 3. CONTEÚDO */}
              <View style={styles.cardContent}>

                {/* HEADER: Marca e Usuário */}
                <View style={styles.cardHeader}>
                  {/* Lado Esquerdo: Marca */}
                  <View style={styles.brandContainer}>
                    <MaterialCommunityIcons name="bike-fast" size={24} color={theme.colors.primary} />
                    <Text style={styles.brandName}>MotoWave</Text>
                  </View>

                  {/* Lado Direito: Usuário + Avatar */}
                  <View style={styles.userBadge}>
                    <Text style={styles.userName}>@{userProfile.username}</Text>
                    <View style={styles.avatarCircle}>
                       <MaterialCommunityIcons name={userProfile.avatar as any} size={16} color="#fff" />
                    </View>
                  </View>
                </View>

                {/* TÍTULO DA VIAGEM */}
                <View style={styles.titleArea}>
                  <Text style={styles.tripTitle} numberOfLines={2}>{customTitle}</Text>
                  <Text style={styles.tripDate}>{formattedDate}</Text>
                </View>

                {/* MÉTRICAS (Apenas Distância e Cidades) */}
                <View style={styles.statsRow}>
                  {/* Distância */}
                  <View style={styles.statItem}>
                    <View style={styles.iconBg}>
                      <MaterialCommunityIcons name="map-marker-distance" size={20} color="#FFF" />
                    </View>
                    <Text style={styles.statValue}>
                      {trip.total_distance.toFixed(1)} <Text style={styles.unit}>km</Text>
                    </Text>
                    <Text style={styles.statLabel}>PERCORRIDOS</Text>
                  </View>

                  <View style={styles.verticalDivider} />

                  {/* Cidades */}
                  <View style={styles.statItem}>
                    <View style={[styles.iconBg, { backgroundColor: theme.colors.info }]}>
                      <FontAwesome5 name="city" size={14} color="#FFF" />
                    </View>
                    <Text style={styles.statValue}>
                      {citiesCount}
                    </Text>
                    <Text style={styles.statLabel}>CIDADES</Text>
                  </View>
                </View>

                {/* FOOTER: Roteiro e Origem/Destino */}
                <View style={styles.footer}>

                   {/* Lista de Cidades (Roteiro) */}
                   {cityListNames.length > 0 && (
                     <View style={styles.routeListContainer}>
                        <Text style={styles.routeLabel}>ROTEIRO</Text>
                        <Text style={styles.routeListText} numberOfLines={2}>
                           {cityListNames.join(" • ")}
                        </Text>
                     </View>
                   )}

                   <View style={styles.divider} />

                   {/* De -> Para */}
                   <View style={styles.pathContainer}>
                      <View style={{flex: 1}}>
                         <Text style={styles.pathLabel}>DE</Text>
                         <Text style={styles.pathCity} numberOfLines={1}>{startCity}</Text>
                      </View>

                      <MaterialCommunityIcons name="arrow-right-thin" size={30} color={theme.colors.primary} style={{marginHorizontal: 10}} />

                      <View style={{flex: 1, alignItems: 'flex-end'}}>
                         <Text style={styles.pathLabel}>PARA</Text>
                         <Text style={styles.pathCity} numberOfLines={1}>{endCity}</Text>
                      </View>
                   </View>

                   <Text style={styles.credits}>
                     Desenvolvido por KytSoftwares com 💚 e gasolina
                   </Text>
                </View>

              </View>
            </View>
          </ViewShot>
        </View>

        {/* Botão Share */}
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={handleShare}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#000" /> : (
            <>
              <MaterialCommunityIcons name="instagram" size={24} color="#000" style={{marginRight: 10}} />
              <Text style={styles.shareBtnText}>COMPARTILHAR STORIES</Text>
            </>
          )}
        </TouchableOpacity>

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    paddingTop: 50,
  },
  headerControls: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20
  },
  headerTitle: { color: '#FFF', fontFamily: theme.fonts.title, fontSize: 14, letterSpacing: 1 },
  closeBtn: { padding: 10, backgroundColor: '#222', borderRadius: 20 },

  editContainer: { width: '85%', marginBottom: 20 },
  editLabel: { color: '#888', fontSize: 12, marginBottom: 5, fontFamily: theme.fonts.body },
  input: {
    backgroundColor: '#1a1a1a', color: '#fff', padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#333', fontFamily: theme.fonts.title
  },

  // CARD STYLES
  cardWrapper: {
    elevation: 10,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  card: {
    width: width * 0.85,
    aspectRatio: 9 / 16, // Formato Stories Vertical
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#121212',
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between'
  },

  // Header Card
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  brandContainer: { flexDirection: 'row', alignItems: 'center' },
  brandName: { color: '#FFF', fontFamily: theme.fonts.title, fontSize: 14, marginLeft: 8, letterSpacing: 1 },

  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20
  },
  userName: { color: '#fff', fontSize: 11, fontFamily: theme.fonts.title, marginRight: 8 },
  avatarCircle: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center'
  },

  // Title
  titleArea: { marginVertical: 15 },
  tripTitle: {
    color: '#FFF', fontSize: 24, fontFamily: theme.fonts.title,
    textTransform: 'uppercase', lineHeight: 38,
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5
  },
  tripDate: { color: '#fff', fontSize: 12, fontFamily: theme.fonts.title, marginTop: 4, letterSpacing: 1 },

  // Stats Row (Apenas 2 itens agora)
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, marginBottom: 20
  },
  statItem: { alignItems: 'center', flex: 1 },
  iconBg: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6
  },
  statValue: { color: '#FFF', fontSize: 22, fontFamily: theme.fonts.title },
  unit: { fontSize: 12, color: '#AAA', fontWeight: 'normal' },
  statLabel: { color: '#777', fontSize: 9, fontFamily: theme.fonts.title, marginTop: 2, letterSpacing: 1 },
  verticalDivider: { width: 1, height: 40, backgroundColor: '#333' },

  // Footer
  footer: { marginTop: 'auto' },
  routeListContainer: { marginBottom: 15 },
  routeLabel: { color: '#555', fontSize: 9, fontFamily: theme.fonts.title, marginBottom: 4, letterSpacing: 1 },
  routeListText: { color: '#CCC', fontSize: 11, fontFamily: theme.fonts.body, lineHeight: 16 },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 15 },

  pathContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  pathLabel: { color: '#555', fontSize: 9, fontFamily: theme.fonts.title, marginBottom: 2 },
  pathCity: { color: theme.colors.primary, fontSize: 15, fontFamily: theme.fonts.title },

  credits: { color: '#444', fontSize: 10, textAlign: 'center', fontFamily: theme.fonts.body },

  shareBtn: {
    flexDirection: 'row', backgroundColor: theme.colors.primary,
    paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30,
    marginTop: 8, alignItems: 'center', elevation: 5
  },
  shareBtnText: { color: '#000', fontFamily: theme.fonts.title, fontSize: 14 }
});