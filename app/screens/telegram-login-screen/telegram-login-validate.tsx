import React, { useEffect } from "react"
import { View } from "react-native"
import { RouteProp } from "@react-navigation/native"
import { makeStyles, Text } from "@rneui/themed"

import { useI18nContext } from "@app/i18n/i18n-react"
import { Screen } from "@app/components/screen"
import { GaloyErrorBox } from "@app/components/atomic/galoy-error-box"
import { GaloyInfo } from "@app/components/atomic/galoy-info"
import { TelegramLoginButton } from "@app/components/telegram-login"
import { PhoneValidationStackParamList } from "@app/navigation/stack-param-lists"

import { useTelegramLogin } from "./telegram-auth"

export const TelegramLoginScreen: React.FC<{
  route: RouteProp<PhoneValidationStackParamList, "telegramLoginValidate">
}> = ({ route }) => {
  const styles = useStyles()
  const { LL } = useI18nContext()

  const { loading, error, isPollingForAuth, handleTelegramLogin } = useTelegramLogin(
    route.params.phone,
  )

  // Run handleTelegramLogin once on screen mount
  useEffect(() => {
    handleTelegramLogin()
  }, [handleTelegramLogin])

  return (
    <Screen
      preset="scroll"
      style={styles.screenStyle}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <Text type="h2" style={styles.text}>
          {LL.TelegramValidationScreen.text()}
        </Text>

        <Text type="p2" style={styles.description}>
          {LL.TelegramValidationScreen.description()}
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <GaloyErrorBox errorMessage={error} />
          </View>
        )}

        {isPollingForAuth && (
          <View style={styles.infoContainer}>
            <GaloyInfo>{LL.TelegramValidationScreen.waitingForAuthorization()}</GaloyInfo>
          </View>
        )}

        <TelegramLoginButton
          title={LL.TelegramValidationScreen.loginWithTelegram()}
          onPress={handleTelegramLogin}
          loading={loading || isPollingForAuth}
        />
      </View>
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },
  text: {
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    textAlign: "center",
    color: colors.grey2,
    marginBottom: 30,
  },
  errorContainer: {
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
  },
}))
