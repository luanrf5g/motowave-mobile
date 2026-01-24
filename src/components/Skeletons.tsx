import { StyleSheet, View } from "react-native"

import { Skeleton } from "./Skeleton";

// 🦴 Skeleton para a tela de History
export const HistorySkeleton = () => {
  const items = [1, 2, 3, 4]

  return (
    <View style={styles.container}>
      {items.map((key) => (
        <View key={key} style={styles.historyCard}>
          <Skeleton height={50} borderRadius={12} style={{ marginBottom: 12 }} />

          <View style={{paddingHorizontal: 10, paddingBottom: 10}}>
            <Skeleton width='60%' height={120} style={{ marginBottom: 8 }} />
            <Skeleton width='40%' height={14} />
          </View>
        </View>
      ))}
    </View>
  )
}

// 🦴 Skeleton para a tela de Passaporte
export const PassportSkeleton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.passportHeader}>
        <View style={{ marginBottom: 15, alignItems: 'center' }}>
             <Skeleton width={110} height={110} borderRadius={55} />
        </View>

        <Skeleton width={180} height={32} style={{ marginBottom: 8 }} />
        <Skeleton width={100} height={16} style={{ marginBottom: 8 }} />
        <Skeleton width={220} height={14} />
      </View>

      <View style={styles.sectionContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Skeleton width={60} height={12} />
            <Skeleton width={80} height={12} />
        </View>
        <Skeleton width="100%" height={10} borderRadius={5} />
        <Skeleton width={160} height={12} style={{ marginTop: 8, alignSelf: 'center' }} />
      </View>

      <View style={styles.statsRow}>
        <Skeleton width='48%' height={90} borderRadius={16} />
        <Skeleton width='48%' height={90} borderRadius={16} />
      </View>

      <View style={{ marginTop: 10 }}>
         <Skeleton width={100} height={20} style={{ marginBottom: 15 }} />
         <View style={styles.statsRow}>
            <Skeleton width='30%' height={100} borderRadius={16} />
            <Skeleton width='30%' height={100} borderRadius={16} />
            <Skeleton width='30%' height={100} borderRadius={16} />
         </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    width: '100%',
    backgroundColor: '#121212'
  },
  // Estilos History
  historyCard: {
    marginBottom: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333'
  },
  // Estilos Passport
  passportHeader: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10
  },
  sectionContainer: {
    marginBottom: 30
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  }
});