import { StyleSheet, View } from "react-native";

export const PassportSkeleton = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      {/* Logout fake */}
      <View style={{position: 'absolute', top: 50, right: 20, width: 24, height: 24, backgroundColor: '#eee', borderRadius: 12}} />

      {/* Avatar fake */}
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee', marginBottom: 15 }} />

      {/* Nome fake */}
      <View style={{ width: 150, height: 24, backgroundColor: '#eee', borderRadius: 4, marginBottom: 10 }} />

      {/* Badge fake */}
      <View style={{ width: 100, height: 20, backgroundColor: '#eee', borderRadius: 10 }} />
    </View>

    <View style={styles.section}>
      <View style={{width: '100%', height: 15, backgroundColor: '#eee', borderRadius: 4, marginBottom: 10}} />
      <View style={{width: '60%', height: 10, backgroundColor: '#eee', borderRadius: 4}} />
    </View>

    <View style={styles.statsGrid}>
      <View style={[styles.statCard, {height: 100}]}>
        <View style={{width: 30, height: 30, backgroundColor: '#f0f0f0', borderRadius: 15, marginBottom: 10}}/>
        <View style={{width: 60, height: 20, backgroundColor: '#f0f0f0', borderRadius: 4}}/>
      </View>
      <View style={[styles.statCard, {height: 100}]}>
        <View style={{width: 30, height: 30, backgroundColor: '#f0f0f0', borderRadius: 15, marginBottom: 10}}/>
        <View style={{width: 60, height: 20, backgroundColor: '#f0f0f0', borderRadius: 4}}/>
      </View>
    </View>
  </View>
);

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
    paddingTop: 50
  },
  section: { margin: 20, backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 2 },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20 },
  statCard: { backgroundColor: '#fff', width: '48%', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 2 },
});