import { useEffect, useState } from "react"
import { Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { showToast } from "@/utils/toast"

import { AuthService } from "@/services/authService"
import { ProfileService, UserProfile } from "@/services/profileService"

export const useProfileSettings = () => {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    username: '',
    bio: '',
    birthday: '',
    avatar_slug: 'racing-helmet'
  })

  const formatDateToUI = (isoDate?: string) => {
    if(!isoDate) return ''
    const [year, month, day] = isoDate.split('-')
    return `${day}/${month}/${year}`
  }

  const formatDateToDb = (brDate: string) => {
    if(!brDate || brDate.length !== 10) return null
    const [day, month, year] = brDate.split('/')
    return `${year}-${month}-${day}`
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await ProfileService.getProfile()
      if(data) setProfile({
        ...data,
        birthday: formatDateToUI(data.birthday)
      })
    } catch (error) {
      showToast.error("Erro", "Não foi possível carregar seu perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if(!profile.username.trim()) {
      return showToast.info("Atenção", "O apelido não pode ficar vazio")
    }

    const formattedBirthday = formatDateToDb(profile.birthday)

    if(profile.birthday && !formattedBirthday) {
      return showToast.info("Data Inválida", "Preencha a data completa (Dia/Mês/Ano)")
    }

    setSaving(true)
    try {
      await ProfileService.updateProfile({
        username: profile.username,
        bio: profile.bio,
        birthday: formattedBirthday || undefined,
        avatar_slug: profile.avatar_slug
      })
      showToast.success("Perfil Atualizado", "Suas informações foram salvas.")
      navigation.goBack()
    } catch (error: any) {
      showToast.error("Erro ao salvar", error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert("Sair do Motowave", "Tem certeza que deseja desconectar?", [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim', style: 'destructive',
        onPress: async () => { await AuthService.signOut()}
      }
    ])
  }

  const handleBirthdayChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const truncated = cleaned.substring(0, 8)

    let formatted = truncated;
    if(truncated.length > 2) {
      formatted = `${truncated.substring(0, 2)}/${truncated.substring(2)}`
    }
    if(truncated.length > 4) {
      formatted = `${formatted.substring(0, 5)}/${truncated.substring(4)}`
    }

    setProfile(prev => ({ ...prev, birthday: formatted }))
  }

  const updateField = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({...prev, [field]: value}))
  }

  return {
    profile,
    loading,
    saving,
    handleSave,
    handleLogout,
    handleBirthdayChange,
    updateField,
    navigation
  }
}