import * as React from "react"
import { makeStyles, useTheme, Text, Icon } from "@rn-vui/themed"
import { Screen } from "../../components/screen"
import { ScrollView, View } from "react-native"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { circleDiameterThatContainsSquare } from "@app/components/atomic/galoy-icon"

interface Feature {
  icon: string
  title: string
}

interface FeatureItemProps {
  feature: Feature
  isAvailable: boolean
}

const FeatureItem: React.FC<FeatureItemProps> = ({ feature, isAvailable }) => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  return (
    <View style={styles.featureContainer}>
      <Icon
        name={feature.icon}
        type="ionicon"
        color={isAvailable ? colors._black : colors._white}
        backgroundColor={isAvailable ? colors.primary : colors.grey4}
        style={styles.iconStyle}
        size={20}
      />
      <Text type="p2">{feature.title}</Text>
    </View>
  )
}

export const CardDetails: React.FC = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const FEATURES: Feature[] = [
    {
      icon: "globe-outline",
      title: LL.CardDetailsScreen.features.accountManager(),
    },
    {
      icon: "flash-outline",
      title: LL.CardDetailsScreen.features.lightningTransactions(),
    },
    {
      icon: "flash-outline",
      title: LL.CardDetailsScreen.features.onchainDeposits(),
    },
    {
      icon: "shield-outline",
      title: LL.CardDetailsScreen.features.circularEconomies(),
    },
  ]

  const UPCOMING_FEATURES: Feature[] = [
    {
      icon: "shield-outline",
      title: LL.CardDetailsScreen.incommingFeatures.coldStorage(),
    },
    {
      icon: "shield-outline",
      title: LL.CardDetailsScreen.incommingFeatures.lightningNode(),
    },
    {
      icon: "shield-outline",
      title: LL.CardDetailsScreen.incommingFeatures.bitcoinbacked(),
    },
  ]

  const handleNext = () => {
    navigation.navigate("CardThankYou")
  }

  return (
    <Screen>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.topSpacer} />
        {FEATURES.map((feature, index) => (
          <FeatureItem key={`feature-${index}`} feature={feature} isAvailable={true} />
        ))}

        <Text type="p2" style={styles.sectionTitle}>
          {LL.CardDetailsScreen.commingIn()}
        </Text>

        {UPCOMING_FEATURES.map((feature, index) => (
          <FeatureItem key={`upcoming-${index}`} feature={feature} isAvailable={false} />
        ))}

        <Text type="p2">{LL.CardDetailsScreen.andMore()}</Text>
      </ScrollView>

      <View style={styles.buttonsContainer}>
        <GaloyPrimaryButton title={LL.common.next()} onPress={handleNext} />
      </View>
    </Screen>
  )
}

const useStyles = makeStyles(() => {
  const containerSize = circleDiameterThatContainsSquare(22)

  return {
    scrollContainer: {
      marginHorizontal: 40,
      marginBottom: 20,
    },
    topSpacer: {
      marginTop: 30,
    },
    featureContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 30,
      gap: 15,
    },
    iconStyle: {
      borderRadius: containerSize,
      width: containerSize,
      height: containerSize,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionTitle: {
      marginBottom: 30,
    },
    buttonsContainer: {
      flex: 1,
      justifyContent: "flex-end",
      marginBottom: 14,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
  }
})
