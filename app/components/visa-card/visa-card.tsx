import React, { FunctionComponent } from "react"
import { View, ViewStyle, DimensionValue } from "react-native"
import LinearGradient from "react-native-linear-gradient"

import { useI18nContext } from "@app/i18n/i18n-react"
import { Text, makeStyles, useTheme } from "@rn-vui/themed"

import LogoLightMode from "@app/assets/images/app-logo-white.svg"
import VisaPlatinumLightMode from "@app/assets/images/visa-platinum-light.svg"

interface VisaCardProps {
  cardNumber?: string
  name: string
  expiredDate: string
  backgroundColor?: string
  gradientColors?: string[]
  useGradient?: boolean
  gradientStart?: { x: number; y: number }
  gradientEnd?: { x: number; y: number }
  gradientDegrees?: number
  textColor?: string
  cardHeight?: number
  cardWidth?: DimensionValue
  borderRadius?: number
  logoWidth?: number
  visaLogoHeight?: number
  cardNumberFontSize?: number
  expiryDateFontSize?: number
  style?: ViewStyle
}

export const VisaCard: FunctionComponent<VisaCardProps> = ({
  cardNumber = "•••• •••• •••• ••••",
  name,
  expiredDate,
  backgroundColor,
  gradientColors,
  useGradient = false,
  gradientStart,
  gradientEnd,
  gradientDegrees,
  textColor,
  cardHeight = 197,
  cardWidth = "100%",
  borderRadius = 14,
  logoWidth = 130,
  visaLogoHeight = 70,
  cardNumberFontSize,
  expiryDateFontSize,
  style,
}) => {
  const {
    theme: { colors },
  } = useTheme()

  const styles = useStyles({
    backgroundColor,
    textColor,
    cardHeight,
    cardWidth,
    borderRadius,
    cardNumberFontSize,
    expiryDateFontSize,
  })
  const { LL } = useI18nContext()

  const degreesToGradientCoords = (degrees: number) => {
    const normalizedDegrees = ((degrees % 360) + 360) % 360
    const radians = (normalizedDegrees * Math.PI) / 180
    const x = Math.cos(radians)
    const y = Math.sin(radians)

    return {
      start: { x: 0.5 - x / 2, y: 0.5 - y / 2 },
      end: { x: 0.5 + x / 2, y: 0.5 + y / 2 },
    }
  }

  const gradientCoords =
    gradientDegrees !== undefined
      ? degreesToGradientCoords(gradientDegrees)
      : {
          start: gradientStart || { x: 0.2, y: 0 },
          end: gradientEnd || { x: 0.8, y: 1 },
        }

  const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, "")
    const groups = cleaned.match(/.{1,4}/g)
    return groups ? groups.join("  ") : number
  }

  const CardContent = () => (
    <>
      <View style={styles.cardHeader}>
        <LogoLightMode width={logoWidth} style={styles.logo} />
        <VisaPlatinumLightMode height={visaLogoHeight} style={styles.visaLogo} />
      </View>

      <View style={styles.cardNumberContainer}>
        <Text
          type="h1"
          style={styles.cardNumberText}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatCardNumber(cardNumber)}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text
          type="p3"
          style={styles.cardholderName}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {name}
        </Text>
        <View style={styles.expiryContainer}>
          <Text type="p4" style={styles.expiryLabel}>
            {LL.common.validThru()}
          </Text>
          <Text type="p3" style={styles.expiryDate}>
            {expiredDate}
          </Text>
        </View>
      </View>
    </>
  )

  if (useGradient) {
    return (
      <LinearGradient
        colors={gradientColors ?? ["#FFBE0B", colors.orange]}
        start={gradientCoords.start}
        end={gradientCoords.end}
        style={[styles.cardContainer, style]}
      >
        <CardContent />
      </LinearGradient>
    )
  }

  return (
    <View style={[styles.cardContainer, style]}>
      <CardContent />
    </View>
  )
}

const useStyles = makeStyles(
  (
    { colors },
    props: {
      backgroundColor?: string
      textColor?: string
      cardHeight: number
      cardWidth: DimensionValue
      borderRadius: number
      cardNumberFontSize?: number
      expiryDateFontSize?: number
    },
  ) => ({
    cardContainer: {
      backgroundColor: props.backgroundColor || colors.orange,
      borderRadius: props.borderRadius,
      height: props.cardHeight,
      width: props.cardWidth,
      paddingHorizontal: 12,
      paddingVertical: 10,
      justifyContent: "space-between",
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    logo: {
      marginLeft: -15,
    },
    visaLogo: {
      marginTop: -15,
    },
    cardNumberContainer: {
      width: "100%",
      alignItems: "center",
    },
    cardNumberText: {
      fontWeight: "bold",
      ...(props.cardNumberFontSize ? { fontSize: props.cardNumberFontSize } : {}),
      color: props.textColor ?? colors._white,
      letterSpacing: 2,
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    cardFooter: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      paddingBottom: 10,
    },
    cardholderName: {
      textTransform: "uppercase",
      fontWeight: "600",
      color: props.textColor ?? colors._white,
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    expiryContainer: {
      alignItems: "flex-end",
      gap: 1,
    },
    expiryLabel: {
      textTransform: "uppercase",
      color: props.textColor ?? colors._white,
      fontSize: 10,
    },
    expiryDate: {
      ...(props.expiryDateFontSize ? { fontSize: props.expiryDateFontSize } : {}),
      color: props.textColor ?? colors._white,
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  }),
)
