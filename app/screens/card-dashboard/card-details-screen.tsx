import * as React from "react"
import { Icon, makeStyles, Text, useTheme } from "@rn-vui/themed"
import { ScrollView, View, Image, TouchableOpacity } from "react-native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { CardDashboardStackParamList } from "@app/navigation/stack-param-lists"
import { Screen } from "../../components/screen"
import { VisaCard } from "../../components/visa-card/visa-card"
import { testProps } from "@app/utils/testProps"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { useEffect } from "react"
import Clipboard from "@react-native-clipboard/clipboard"
import { toastShow } from "@app/utils/toast"

type CopyableFieldProps = {
  label: string
  value: string
  onCopy: () => void
}

type InfoRowProps = {
  label: string
  value: string
  valueColor?: string
}

const CopyableField: React.FC<CopyableFieldProps> = ({ label, value, onCopy }) => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  return (
    <View style={styles.fieldWrapper}>
      <Text type="p3">{label}</Text>
      <TouchableOpacity style={styles.fieldContainer} onPress={onCopy}>
        <Text style={styles.fieldValue}>{value}</Text>
        <GaloyIcon name="copy-paste" size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  )
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, valueColor }) => {
  const styles = useStyles()

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel} type="p3">
        {label}
      </Text>
      <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  )
}

export const CardDetailsScreen: React.FC = () => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()
  const { LL } = useI18nContext()
  const navigation = useNavigation<StackNavigationProp<CardDashboardStackParamList>>()

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <GaloyIconButton
          style={styles.headerRight}
          name={"settings"}
          size="medium"
          iconOnly
          color={colors.black}
          onPress={() => navigation.navigate("cardDashboardScreen")}
        />
      ),
    })
  }, [navigation, styles])

  const handleCopy = (text: string, fieldName: string) => {
    Clipboard.setString(text)
    toastShow({ type: "success", message: "Copied to clipboard", LL })
  }

  return (
    <Screen>
      <ScrollView
        {...testProps("card-details")}
        contentContainerStyle={styles.scrollViewContainer}
      >
        <View style={styles.cardContainer}>
          <VisaCard
            expiredDate={"01/28"}
            name={"SATOSHI NAKAMOTO"}
            cardNumber="2121 2121 2121 2121"
            useGradient
            gradientDegrees={45}
          />
        </View>

        <CopyableField
          label="Card number"
          value="4242 4242 4242 4242"
          onCopy={() => handleCopy("4242424242424242", "Card number")}
        />

        <View style={styles.rowContainer}>
          <View style={styles.halfWidth}>
            <CopyableField
              label="Expiry date"
              value="09/29"
              onCopy={() => handleCopy("09/29", "Expiry date")}
            />
          </View>
          <View style={styles.halfWidth}>
            <CopyableField
              label="CVV"
              value="123"
              onCopy={() => handleCopy("123", "CVV")}
            />
          </View>
        </View>

        <CopyableField
          label="Cardholder name"
          value="NAME SURNAME"
          onCopy={() => handleCopy("NAME SURNAME", "Cardholder name")}
        />

        <View style={styles.infoWrapper}>
          <Text style={styles.sectionTitle}>Card information</Text>
          <View style={styles.infoSection}>
            <InfoRow label="Card type" value="Virtual Visa debit" />
            <View style={styles.divider} />
            <InfoRow label="Status" value="Active" valueColor={colors.success} />
            <View style={styles.divider} />
            <InfoRow label="Issued" value="April 23, 2025" />
            <View style={styles.divider} />
            <InfoRow label="Network" value="Visa" />
          </View>
        </View>

        <View style={styles.warningBox}>
          <View style={styles.rowContainer}>
            <GaloyIcon name="warning" size={18} color={colors.warning} />
            <Text style={styles.warningTitle} type="p2">
              Keep your details safe
            </Text>
          </View>
          <Text style={styles.warningDescription} type="p3">
            Never share your card details with anyone. Blink will never ask for your
            information via email or phone.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  scrollViewContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    rowGap: 20,
  },
  headerRight: {
    marginRight: 12,
  },
  cardContainer: {
    position: "relative",
    overflow: "hidden",
  },
  fieldWrapper: {
    gap: 8,
  },

  fieldContainer: {
    backgroundColor: colors.grey5,
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  infoWrapper: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    color: colors.grey1,
  },
  infoSection: {
    backgroundColor: colors.grey5,
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    color: colors.grey2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.black,
  },
  divider: {
    height: 1,
    backgroundColor: colors.transparent,
  },
  warningBox: {
    flexDirection: "column",
    backgroundColor: colors.grey5,
    borderRadius: 8,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  warningTitle: {
    color: colors.warning,
  },
  warningDescription: {
    color: colors.grey2,
  },
}))
