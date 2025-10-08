import * as React from "react"
import { CheckBox, makeStyles, Text } from "@rn-vui/themed"
import { Screen } from "../../components/screen"
import { View } from "react-native"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

export const CardSubscribe: React.FC = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const [isAgreed, setIsAgreed] = React.useState(false)

  const handleAccept = () => {
    if (isAgreed) {
      //navigation.navigate("")
    }
  }

  return (
    <Screen>
      <View style={styles.contentContainer}>
        <View style={styles.cardContainer}>
          <Text type="p2" style={styles.cardTitle}>
            {LL.CardSubscribeScreen.cardTitle()}
          </Text>

          <Text type="h1" style={styles.price}>
            $1,000
          </Text>

          <Text type="p3" style={styles.perYear}>
            {LL.CardSubscribeScreen.perYear()}
          </Text>

          <View style={styles.infoRow}>
            <Text type="p3" style={styles.label}>
              {LL.CardSubscribeScreen.status.label()}
            </Text>
            <Text type="p3" style={styles.statusPending}>
              {LL.CardSubscribeScreen.status.paymentPending()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text type="p3" style={styles.label}>
              {LL.CardSubscribeScreen.renewalDate.label()}
            </Text>
            <Text type="p3" style={styles.value}>
              Aug 21, 2026
            </Text>
          </View>
        </View>

        <View style={styles.checkboxContainer}>
          <CheckBox
            checked={isAgreed}
            iconType="ionicon"
            checkedIcon={"checkbox"}
            uncheckedIcon={"square-outline"}
            onPress={() => setIsAgreed(!isAgreed)}
            containerStyle={styles.checkboxStyle}
          />
          <View style={styles.agreementTextContainer}>
            <Text type="p3" style={styles.agreementText}>
              {LL.CardSubscribeScreen.agreement.text()}{" "}
              <Text style={styles.link} onPress={() => {}}>
                {LL.CardSubscribeScreen.agreement.termsOfService()}
              </Text>
              ,{" "}
              <Text style={styles.link} onPress={() => {}}>
                {LL.CardSubscribeScreen.agreement.privacyPolicy()}
              </Text>
              , {LL.CardSubscribeScreen.agreement.and()}{" "}
              <Text style={styles.link} onPress={() => {}}>
                {LL.CardSubscribeScreen.agreement.cardholderAgreement()}
              </Text>
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <GaloyPrimaryButton
          title={LL.CardSubscribeScreen.acceptButton()}
          onPress={handleAccept}
          disabled={!isAgreed}
        />
      </View>
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  cardContainer: {
    backgroundColor: colors.grey5,
    borderRadius: 16,
    padding: 10,
    paddingBottom: 5,
    marginBottom: 17,
  },
  cardTitle: {
    color: colors.black,
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "semibold",
  },
  price: {
    color: colors.primary,
    textAlign: "center",
    fontWeight: "semibold",
  },
  perYear: {
    color: colors.grey2,
    textAlign: "center",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  label: {
    color: colors.grey2,
  },
  statusPending: {
    color: colors.primary,
    fontWeight: "500",
  },
  value: {
    color: colors.black,
    fontWeight: "500",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  checkboxStyle: {
    padding: 0,
    margin: 0,
    marginRight: 15,
    marginLeft: 0,
  },
  agreementTextContainer: {
    flex: 1,
    marginTop: 2,
  },
  agreementText: {
    color: colors.black,
    lineHeight: 22,
  },
  link: {
    color: colors.primary,
    fontWeight: "500",
  },
  buttonsContainer: {
    justifyContent: "flex-end",
    marginBottom: 14,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
}))
