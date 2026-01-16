import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { BaseToast, BaseToastProps } from 'react-native-toast-message'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { theme } from './theme'

const { width } = Dimensions.get('window')

const CustomToast = ({ title, message, color, iconName }: any) => (
  <View style={[styles.container, { borderLeftColor: color}]}>
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name={iconName} size={28} color={color} />
    </View>
    <View style={styles.textContainer}>
      <Text style={[styles.title, { color: color }]}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  </View>
)

export const toastConfig = {
  success: (props: any) => (
    <CustomToast
      title={props.text1}
      message={props.text2}
      color={theme.colors.primary}
      iconName="check-circle-outline"
    />
  ),

  error: (props: any) => (
    <CustomToast
      title={props.text1}
      message={props.text2}
      color={theme.colors.danger}
      iconName="alert-circle-outline"
    />
  ),

  info: (props: any) => (
    <CustomToast
      title={props.text1}
      message={props.text2}
      color={theme.colors.info}
      iconName="information-outline"
    />
  ),

  newCity: (props: any) => (
    <CustomToast
      title={props.text1 || "Nova conquista!"}
      message={props.text2}
      color='#F1C40F'
      iconName="map-marker-star"
    />
  )
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    width: width - 40,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderLeftWidth: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 9999,
  },
  iconContainer: {
    marginRight: 15
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  message: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    marginTop: 2
  }
});