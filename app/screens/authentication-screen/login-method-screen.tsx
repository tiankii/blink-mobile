import React, { useState, useMemo } from "react"
import { View } from "react-native"

import { StackNavigationProp } from "@react-navigation/stack"
import { useNavigation } from "@react-navigation/native"
import { makeStyles, Text, useTheme } from "@rneui/themed"

import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { OptionSelector, Option } from "@app/components/option-selector"
import AppLogoLightMode from "@app/assets/logo/app-logo-light.svg"
import AppLogoDarkMode from "@app/assets/logo/app-logo-dark.svg"
import { PhoneCodeChannelType } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { Screen } from "@app/components/screen"

import { PhoneLoginInitiateType, useRequestPhoneCodeLogin } from "../phone-auth-screen"

export enum LoginChannels {
  Telegram = "TELEGRAM",
  Sms = "SMS",
  Whatsapp = "WHATSAPP",
  Email = "EMAIL",
}

export const LoginMethodScreen: React.FC = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const {
    theme: { mode },
  } = useTheme()

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { isTelegramSupported, isSmsSupported, isWhatsAppSupported } =
    useRequestPhoneCodeLogin()

  const [selected, setSelected] = useState<LoginChannels | undefined>()

  const AppLogo = mode === "dark" ? AppLogoDarkMode : AppLogoLightMode

  const useLabels: Record<LoginChannels, string> = {
    TELEGRAM: LL.LoginMethodScreen.useTelegram(),
    SMS: LL.LoginMethodScreen.useSms(),
    WHATSAPP: LL.LoginMethodScreen.useWhatsapp(),
    EMAIL: LL.LoginMethodScreen.useEmail(),
  }

  const handleSubmit = () => {
    if (!selected) return

    if (selected === LoginChannels.Email) {
      navigation.navigate("emailLoginInitiate")
      return
    }

    navigation.navigate("phoneFlow", {
      screen: "phoneLoginInitiate",
      params: {
        type: PhoneLoginInitiateType.Login,
        channel: selected as PhoneCodeChannelType,
        title: useLabels[selected],
      },
    })
  }

  const handleSelect = (channel: string) => {
    if (channel) setSelected(channel as LoginChannels)
  }

  const options: Option[] = useMemo(
    () => [
      {
        label: LL.support.telegram(),
        value: LoginChannels.Telegram,
        icon: "send",
        active: isTelegramSupported,
        recommended: true,
      },
      {
        label: LL.support.sms(),
        value: LoginChannels.Sms,
        icon: "call-outline",
        active: isSmsSupported,
      },
      {
        label: LL.support.whatsapp(),
        value: LoginChannels.Whatsapp,
        icon: "logo-whatsapp",
        active: isWhatsAppSupported,
      },
      {
        label: LL.support.email(),
        value: LoginChannels.Email,
        icon: "mail-outline",
        active: true,
      },
    ],
    [LL, isTelegramSupported, isSmsSupported, isWhatsAppSupported],
  )

  return (
    <Screen>
      <View style={styles.header}>
        <AppLogo style={styles.logo} />
        <Text type="h1" style={styles.title}>
          {LL.LoginMethodScreen.title()}
        </Text>
        <OptionSelector selected={selected} onSelect={handleSelect} options={options} />
      </View>

      <View style={styles.bottom}>
        {selected && (
          <GaloyPrimaryButton
            title={useLabels[selected]}
            onPress={handleSubmit}
            disabled={!selected}
            containerStyle={styles.buttonContainer}
          />
        )}
      </View>
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  header: {
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  logo: {
    alignSelf: "center",
    width: "100%",
    height: 80,
    marginBottom: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
    color: colors.grey0,
    fontSize: 18,
  },
  buttonContainer: {
    marginVertical: 6,
  },
  bottom: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "flex-end",
    marginBottom: 50,
  },
}))
