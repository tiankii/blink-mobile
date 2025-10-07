import * as React from "react"
import { makeStyles, Text } from "@rn-vui/themed"
import { Screen } from "../../components/screen"
import { VisaCard } from "../../components/visa-card/visa-card"
import { View } from "react-native"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

export const BitcoinCard: React.FC = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  return (
    <Screen>
      <View style={styles.cardStyle}>
        <VisaCard
          expiredDate={"01/28"}
          name={"satoshi nakamoto"}
          cardNumber="2121 2121 2121 2121"
          useGradient
          gradientDegrees={-60}
        />
        <Text type="h2">{LL.BitcoinCardScreen.subtitle()}</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <GaloyPrimaryButton
          title={LL.common.next()}
          onPress={() => navigation.navigate("CardDetails")}
          disabled={false}
        />
      </View>
    </Screen>
  )
}

const useStyles = makeStyles(() => ({
  cardStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    padding: 20,
    gap: 15,
    marginTop: -70,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 14,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 2,
  },
}))
