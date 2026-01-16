import Toast from "react-native-toast-message";

export const showToast = {
  success: (title: string, message?: string) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000
    })
  },
  error: (title: string, message?: string) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000
    })
  },
  info: (title: string, message?: string) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top'
    })
  },

  newCity: (cityName: string) => {
    Toast.show({
      type: 'newCity',
      text1: 'Território Desbravado',
      text2: `Você chegou em ${cityName}`,
      position: 'top',
      visibilityTime: 6000
    })
  }
}