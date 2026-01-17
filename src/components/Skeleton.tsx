import { useEffect, useRef } from "react";
import { DimensionValue, ViewStyle, Animated, StyleSheet } from "react-native";

import { theme } from "@/config/theme";

interface SkeletonProps {
  width?: DimensionValue,
  height?: DimensionValue,
  borderRadius?: number,
  style?: ViewStyle
}

export const Skeleton = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style
}: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true
        })
      ])
    )
    animation.start()

    return () => animation.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity
        },
        style
      ]}
    />
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.surface,
    marginBottom: 8
  }
})