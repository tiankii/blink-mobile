import * as React from "react"
import { Linking } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Text, makeStyles } from "@rneui/themed"

import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useI18nContext } from "@app/i18n/i18n-react"

import { OnboardingLayout } from "./onboarding-layout"

export const SupportOnboardingScreen: React.FC = () => {
  const { LL } = useI18nContext()
  const styles = useStyles()

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const handlePrimaryAction = () => {
    navigation.replace("Primary")
  }

  const handleSecondaryAction = (email: string) => {
    Linking.openURL(`mailto:${email}`)
  }

  const messagePrefix = LL.OnboardingScreen.supportScreen.contactInfo.messagePrefix()
  const contactEmail = LL.OnboardingScreen.supportScreen.contactInfo.contactEmail()
  const messageSuffix = LL.OnboardingScreen.supportScreen.contactInfo.messageSuffix()

  return (
    <OnboardingLayout
      title={LL.OnboardingScreen.supportScreen.title()}
      customContent={
        <>
          <Text style={styles.descriptionText}>
            {LL.OnboardingScreen.supportScreen.description()}
          </Text>
          <Text style={styles.descriptionText}>
            {messagePrefix}
            <Text
              style={styles.linkText}
              onPress={() => Linking.openURL(`mailto:${contactEmail}`)}
            >
              {contactEmail}
            </Text>
            {messageSuffix}
          </Text>
        </>
      }
      primaryLabel={LL.OnboardingScreen.supportScreen.primaryButton()}
      onPrimaryAction={handlePrimaryAction}
      secondaryLabel={LL.OnboardingScreen.supportScreen.secondaryButton()}
      onSecondaryAction={() => handleSecondaryAction(contactEmail)}
      iconName="support"
    />
  )
}

const useStyles = makeStyles(({ colors }) => ({
  descriptionText: {
    color: colors.grey2,
    fontSize: 16,
    marginBottom: 8,
  },
  linkText: {
    color: colors.primary3,
    textDecorationLine: "underline",
  },
}))
