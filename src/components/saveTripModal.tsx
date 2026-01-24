import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Tipagem das Props que o Modal recebe
interface City {
  name: string;
  state: string;
}

interface SaveTripModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (title: string) => void;
  distance: number;
  cities: City[];
  isSaving: boolean;
}

export const SaveTripModal = ({
  visible,
  onClose,
  onConfirm,
  distance,
  cities,
  isSaving
}: SaveTripModalProps) => {

  const [tripTitle, setTripTitle] = useState("");

  const handleConfirm = () => {
    const finalTitle = tripTitle.trim() === ""
      ? `Viagem de ${new Date().toLocaleDateString('pt-BR')}`
      : tripTitle;

    onConfirm(finalTitle);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Resumo da Viagem</Text>
            <TouchableOpacity onPress={onClose} disabled={isSaving}>
              <MaterialCommunityIcons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Input */}
          <Text style={styles.inputLabel}>Dê um nome para sua aventura:</Text>
          <TextInput
            style={styles.input}
            value={tripTitle}
            onChangeText={setTripTitle}
            placeholder="Ex: Serra do Rio do Rastro"
            placeholderTextColor="#999"
            autoFocus={false}
            editable={!isSaving}
          />

          {/* Stats Grid */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{distance.toFixed(1)} km</Text>
              <Text style={styles.statLabel}>Distância</Text>
            </View>
            <View style={styles.statDivider}/>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{cities.length}</Text>
              <Text style={styles.statLabel}>Cidades</Text>
            </View>
          </View>

          {/* Roteiro (Horizontal Scroll) */}
          {cities.length > 0 && (
            <View style={styles.citiesContainer}>
              <Text style={styles.citiesTitle}>Roteiro:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {cities.map((city, index) => (
                  <View key={index} style={styles.cityChip}>
                    <Text style={styles.cityText}>{city.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Botão de Ação */}
          <TouchableOpacity
            style={[styles.confirmButton, isSaving && { opacity: 0.7 }]}
            onPress={handleConfirm}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.confirmButtonText}>Confirmar e Salvar</Text>
                <MaterialCommunityIcons name="check" size={20} color="#fff" style={{marginLeft: 5}}/>
              </>
            )}
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    paddingBottom: 40,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  inputLabel: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50' },
  statLabel: { fontSize: 12, color: '#7F8C8D' },
  statDivider: { width: 1, height: 30, backgroundColor: '#ddd' },
  citiesContainer: { marginBottom: 25 },
  citiesTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 10 },
  cityChip: {
    backgroundColor: '#E8F6F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D1F2EB'
  },
  cityText: { color: '#16A085', fontSize: 12, fontWeight: '600' },
  confirmButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 16,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  confirmButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});