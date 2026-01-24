import { StyleSheet, View } from "react-native";

export const PassportSkeleton = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      {/* Logout fake */}
      <View style={{position: 'absolute', top: 50, right: 20, width: 24, height: 24, backgroundColor: '#1E1E1E', borderRadius: 12}} />

      {/* Avatar fake */}
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#1E1E1E', marginBottom: 15 }} />

      {/* Nome fake */}
      <View style={{ width: 150, height: 24, backgroundColor: '#1E1E1E', borderRadius: 4, marginBottom: 10 }} />

      {/* Badge fake */}
      <View style={{ width: 100, height: 20, backgroundColor: '#1E1E1E', borderRadius: 10 }} />
    </View>

    <View style={styles.section}>
      <View style={{width: '100%', height: 15, backgroundColor: '#1E1E1E', borderRadius: 4, marginBottom: 10}} />
      <View style={{width: '60%', height: 10, backgroundColor: '#1E1E1E', borderRadius: 4}} />
    </View>

    <View style={styles.statsGrid}>
      <View style={[styles.statCard, {height: 100}]}>
        <View style={{width: 30, height: 30, backgroundColor: '#252525', borderRadius: 15, marginBottom: 10}}/>
        <View style={{width: 60, height: 20, backgroundColor: '#252525', borderRadius: 4}}/>
      </View>
      <View style={[styles.statCard, {height: 100}]}>
        <View style={{width: 30, height: 30, backgroundColor: '#252525', borderRadius: 15, marginBottom: 10}}/>
        <View style={{width: 60, height: 20, backgroundColor: '#252525', borderRadius: 4}}/>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    backgroundColor: '#000',
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
  section: {
    margin: 20,
    backgroundColor: '#000',
    padding: 20,
    borderRadius: 15,
    elevation: 2
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20
  },
  statCard: {
    backgroundColor: '#000',
    width: '48%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2
  },
});