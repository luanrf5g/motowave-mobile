import { StyleSheet, Text, View } from "react-native"

export const Social = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rede de Viajantes</Text>
    <Text>Aqui aparecerão seus amigos, rotas agendadas e alertas SOS.</Text>
    <Text>Funcionalidade Futura!</Text>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  }
})