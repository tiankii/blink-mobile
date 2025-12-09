import * as React from "react"
import { Icon, makeStyles, Text, useTheme } from "@rn-vui/themed"
import { ScrollView, View } from "react-native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { CardDashboardStackParamList } from "@app/navigation/stack-param-lists"
import { Screen } from "../../components/screen"
import { VisaCard } from "../../components/visa-card/visa-card"
import { testProps } from "@app/utils/testProps"
import { IconNamesType } from "@app/components/atomic/galoy-icon"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { useEffect } from "react"

export const CardDashboardScreen: React.FC = () => {
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

  type Target =
    | "scanningQRCode"
    | "sendBitcoinDestination"
    | "receiveBitcoin"
    | "transactionHistory"

  const buttons = [
    {
      title: "Details",
      target: "receiveBitcoin" as Target,
      icon: "eye" as IconNamesType,
    },
    {
      title: "Freeze",
      target: "sendBitcoinDestination" as Target,
      icon: "freeze" as IconNamesType,
    },
    {
      title: "Set limits",
      target: "scanningQRCode" as Target,
      icon: "limit" as IconNamesType,
    },
    {
      title: "Statements",
      target: "scanningQRCode" as Target,
      icon: "book" as IconNamesType,
    },
  ]
  const onMenuClick = (target: Target) => {
    navigation.navigate(target as any)
  }

  return (
    <Screen>
      <ScrollView
        {...testProps("card-dashboard")}
        contentContainerStyle={styles.scrollViewContainer}
      >
        <VisaCard
          expiredDate={".. / .."}
          name={"satoshi nakamoto"}
          cardNumber=".... .... .... 2121"
          useGradient
          gradientDegrees={45}
        />
        <View style={styles.balance}>
          <View>
            <Text type="p1">$21.21</Text>
            <Text type="p4" color={colors.grey1}>
              ~ Kč500.00
            </Text>
          </View>
          <View style={styles.addButton}>
            <Text type="p3">Add funds</Text>
            <Icon type="ionicon" name="add-outline" color={colors.primary} size={20} />
          </View>
        </View>
        <View style={styles.listItemsContainer}>
          {buttons.map((item) => (
            <View key={item.icon} style={styles.button}>
              <GaloyIconButton
                name={item.icon}
                size="large"
                text={item.title}
                onPress={() => onMenuClick(item.target)}
              />
            </View>
          ))}
        </View>
        <Text type="p1" style={styles.noTransaction}>
          No transactions yet
        </Text>
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
  listItemsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: colors.grey5,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  button: {
    maxWidth: "25%",
    flexGrow: 1,
  },
  balance: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: colors.grey5,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  noTransaction: {
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
    color: colors.grey2,
  },
  headerRight: {
    marginRight: 12,
  },
}))
