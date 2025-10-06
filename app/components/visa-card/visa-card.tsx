import React, { FunctionComponent } from "react"
import { View } from "react-native"

import { useI18nContext } from "@app/i18n/i18n-react"
import { Text, makeStyles } from "@rn-vui/themed"

import LogoLightMode from "@app/assets/images/app-logo-white.svg"
import VisaPlatinumLightMode from "@app/assets/images/visa-platinum-light.svg"

interface VisaCardProps {
  cardNumber?: string
  name: string
  expiredDate: string
}

export const VisaCard: FunctionComponent<VisaCardProps> = ({
  cardNumber,
  name,
  expiredDate,
}) => {
  const styles = useStyles()
  const { LL } = useI18nContext()

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <LogoLightMode width={130} style={styles.logo} />
        <VisaPlatinumLightMode height={70} style={styles.visaLogo} />
      </View>

      <View style={styles.cardNumberContainer}>
        <Text style={styles.cardNumberText}>{cardNumber}</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.cardholderName}>{name}</Text>
        <View style={styles.expiryContainer}>
          <Text type="p4" style={styles.expiryLabel}>
            {LL.common.expires()}
          </Text>
          <Text type="p3" style={styles.expiryDate}>
            {expiredDate}
          </Text>
        </View>
      </View>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  cardContainer: {
    backgroundColor: colors.orange,
    borderRadius: 14,
    height: 197,
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 7,
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
    fontSize: 22,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  cardholderName: {
    textTransform: "uppercase",
    fontSize: 27,
  },
  expiryContainer: {
    alignItems: "flex-end",
    gap: 7,
  },
  expiryLabel: {
    textTransform: "uppercase",
  },
  expiryDate: {
    fontSize: 27,
  },
}))
