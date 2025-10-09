import * as React from "react"
import { makeStyles, useTheme, Text, Icon } from "@rn-vui/themed"
import { View, TouchableOpacity, Animated, GestureResponderEvent } from "react-native"

import { GaloyIcon } from "../atomic/galoy-icon"

interface NotificationBannerProps {
  title: string
  subtitle: string
  onPress?: () => void
  onDismiss?: () => void
  visible?: boolean
  showIcon?: boolean
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  title,
  subtitle,
  onPress,
  onDismiss,
  visible = true,
  showIcon = true,
}) => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()
  const [isVisible, setIsVisible] = React.useState(visible)
  const fadeAnim = React.useRef(new Animated.Value(visible ? 1 : 0)).current

  React.useEffect(() => {
    setIsVisible(visible)
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [visible, fadeAnim])

  const handleDismiss = (event: GestureResponderEvent) => {
    event.stopPropagation()
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false)
      onDismiss?.()
    })
  }

  const handleBannerPress = () => {
    onPress?.()
  }

  if (!isVisible) {
    return null
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity
        onPress={handleBannerPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
        style={styles.touchableWrapper}
      >
        <View style={styles.contentWrapper}>
          {showIcon && (
            <View style={styles.iconContainer}>
              <Icon
                name="notifications-outline"
                type="ionicon"
                color={colors.black}
                size={24}
              />
            </View>
          )}

          <View style={styles.textContainer}>
            <Text type="p1" bold style={styles.title}>
              {title}
            </Text>
            <Text type="p3" style={styles.subtitle}>
              {subtitle}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleDismiss}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <GaloyIcon name="close" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  container: {
    backgroundColor: colors.grey5,
    borderRadius: 12,
  },
  touchableWrapper: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.black,
    lineHeight: 20,
  },
  subtitle: {
    color: colors.black,
    lineHeight: 18,
    opacity: 0.8,
  },
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
  },
}))
