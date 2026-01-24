import { useState } from "react"
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

import { theme } from "@/config/theme"
import { supabase } from "@/lib/supabase"
import { showToast } from "@/utils/toast"

export const ContactScreen = () => {
  const navigation = useNavigation()

  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if(!subject.trim() || !message.trim()) {
      showToast.info('Ops', 'Preencha todos os campos para enviar.')
      return;
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('feedbacks')
        .insert({
          user_id: user?.id,
          subject,
          message
        })

      if (error) throw error

      showToast.success('Recebido!', 'Obrigado pelo feedback!')
      navigation.goBack()
    } catch (error) {
      showToast.error('Erro', 'Não foi possível enviar o feedback.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.backView}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backbutton}
        >
          <MaterialCommunityIcons name='arrow-left' size={20} color='#fff' />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Fale Conosco</Text>
      <Text style={styles.subtitle}>Encontrou um bug? Tem uma ideia? Mande pra gente!</Text>

      <Text style={styles.label}>Assunto</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Sugestão de nova funcionalidade"
        placeholderTextColor="#666"
        value={subject}
        onChangeText={setSubject}
      />

      <Text style={styles.label}>Mensagem</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Escreva aqui..."
        placeholderTextColor="#666"
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        value={message}
        onChangeText={setMessage}
      />

      <TouchableOpacity style={styles.button} onPress={handleSend} disabled={loading}>
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>ENVIAR</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20, justifyContent: 'center' },
  backView: { position: 'absolute', top: 50, left: 20, },
  backbutton: { alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 28, backgroundColor: theme.colors.primary },
  title: { color: theme.colors.primary, fontSize: 28, fontFamily: theme.fonts.title, marginBottom: 5 },
  subtitle: { color: '#888', fontSize: 14, marginBottom: 30 },
  label: { color: '#FFF', marginBottom: 8, fontFamily: theme.fonts.bold },
  input: { backgroundColor: '#1a1a1a', color: '#FFF', borderRadius: 10, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  textArea: { height: 150 },
  button: { backgroundColor: theme.colors.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { fontFamily: theme.fonts.bold, fontSize: 16 }
});