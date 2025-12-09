import * as React from "react"
import { Icon, makeStyles, Text, useTheme } from "@rn-vui/themed"
import { ScrollView, View, Image } from "react-native"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { CardDashboardStackParamList } from "@app/navigation/stack-param-lists"
import { Screen } from "../../components/screen"
import { VisaCard } from "../../components/visa-card/visa-card"
import { testProps } from "@app/utils/testProps"
import { IconNamesType } from "@app/components/atomic/galoy-icon"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { useEffect, useState } from "react"

export const CardDashboardScreen: React.FC = () => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()
  const { LL } = useI18nContext()
  const navigation = useNavigation<StackNavigationProp<CardDashboardStackParamList>>()
  const [isFrozen, setIsFrozen] = useState(false)

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <GaloyIconButton
          style={styles.headerLeft}
          name={"arrow-left"}
          size="medium"
          iconOnly
          color={colors.black}
          onPress={() => navigation.navigate("cardDashboardScreen")}
        />
      ),

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

  const onMenuClick = (target: Target) => {
    navigation.navigate(target)
  }

  type Target = "cardDashboardScreen"

  const buttons = [
    {
      id: "1",
      title: "Details",
      event: () => onMenuClick("cardDashboardScreen"),
      icon: "eye" as IconNamesType,
    },
    {
      id: "2",
      title: "Freeze",
      event: () => setIsFrozen(!isFrozen), //Mock
      icon: "freeze" as IconNamesType,
    },
    {
      id: "3",
      title: "Set limits",
      event: () => onMenuClick("cardDashboardScreen"),
      icon: "limit" as IconNamesType,
    },
    {
      id: "4",
      title: "Statements",
      event: () => onMenuClick("cardDashboardScreen"),
      icon: "book" as IconNamesType,
    },
  ]

  return (
    <Screen>
      <ScrollView
        {...testProps("card-dashboard")}
        contentContainerStyle={styles.scrollViewContainer}
      >
        <View style={styles.cardContainer}>
          <VisaCard
            expiredDate={".. / .."}
            name={"satoshi nakamoto"}
            cardNumber=".... .... .... 2121"
            useGradient
            gradientDegrees={45}
          />
          {isFrozen && (
            <View style={styles.blurOverlay}>
              <Image
                source={require("../../assets/images/blur-card.png")}
                resizeMode="cover"
                style={{ width: "103%", height: "103%" }}
              />
              <View style={styles.frozenContent}>
                <Icon
                  type="ionicon"
                  name="lock-closed-outline"
                  color={colors.error}
                  backgroundColor={"#DC262633"}
                  style={{ padding: 12, borderRadius: 50 }}
                  size={40}
                />
                <Text type="h2" bold style={{ fontWeight: "bold" }}>
                  Card frozen
                </Text>
                <Text type="p4">Card is temporarily disabled</Text>
              </View>
            </View>
          )}
        </View>
        <View style={styles.balance}>
          <View>
            <Text type="p1">$21.21</Text>
            <Text type="p4" color={colors.grey1}>
              ~ Kč500.00
            </Text>
          </View>
          <View style={[styles.addButton, isFrozen ? styles.addButtonDisabled : {}]}>
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
                onPress={() => item.event()}
                color={isFrozen && item.id == "2" ? colors.error : undefined}
                backgroundColor={isFrozen && item.id == "2" ? colors.error9 : undefined}
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
  addButtonDisabled: {
    opacity: 0.5,
  },
  noTransaction: {
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
    color: colors.grey2,
  },
  headerLeft: {
    marginLeft: 12,
  },
  headerRight: {
    marginRight: 12,
  },
  cardContainer: {
    position: "relative",
    overflow: "hidden",
  },
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  frozenContent: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.58)",
    width: "100%",
    height: "100%",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
}))
