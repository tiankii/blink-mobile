import * as React from "react"
import { useEffect } from "react"
import { View } from "react-native"
import { LocalizedString } from "typesafe-i18n"

import { useI18nContext } from "@app/i18n/i18n-react"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { useFeatureFlags } from "@app/config/feature-flags-context"
import CustomModal from "@app/components/custom-modal/custom-modal"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Text, makeStyles, useTheme } from "@rneui/themed"

import useAppCheckToken from "./use-device-token"
import { PhoneLoginInitiateType } from "../phone-auth-screen"
import { DeviceAccountFailModal } from "./device-account-fail-modal"
import { useCreateDeviceAccount } from "./use-create-device-account"

export type DeviceAccountModalProps = {
  isVisible: boolean
  closeModal: () => void
}

export const DeviceAccountModal: React.FC<DeviceAccountModalProps> = ({
  isVisible,
  closeModal,
}) => {
  const { deviceAccountEnabled } = useFeatureFlags()
  const appCheckToken = useAppCheckToken({ skip: !deviceAccountEnabled })

  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  const { LL } = useI18nContext()
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "getStarted">>()

  const { createDeviceAccountAndLogin, loading, hasError, resetError } =
    useCreateDeviceAccount()

  const createAndLogin = async () => {
    await createDeviceAccountAndLogin(appCheckToken || "undefined", closeModal)
  }

  useEffect(() => {
    if (!isVisible) {
      resetError()
    }
  }, [isVisible, resetError])

  const navigateToPhoneLogin = () => {
    navigation.navigate("login", {
      type: PhoneLoginInitiateType.CreateAccount,
    })
    closeModal()
  }

  const navigateToHomeScreen = () => {
    navigation.navigate("Primary")
    closeModal()
  }

  return hasError ? (
    <DeviceAccountFailModal
      isVisible={isVisible}
      closeModal={closeModal}
      navigateToPhoneLogin={navigateToPhoneLogin}
      navigateToHomeScreen={navigateToHomeScreen}
    />
  ) : (
    <CustomModal
      isVisible={isVisible}
      toggleModal={closeModal}
      image={<GaloyIcon name="info" color={colors.primary3} size={100} />}
      title={LL.GetStartedScreen.trialAccountHasLimits()}
      body={
        <View style={styles.modalBody}>
          <LimitItem text={LL.GetStartedScreen.trialAccountLimits.noBackup()} />
          <LimitItem text={LL.GetStartedScreen.trialAccountLimits.sendingLimit()} />
          <LimitItem text={LL.GetStartedScreen.trialAccountLimits.noOnchain()} />
        </View>
      }
      primaryButtonTitle={LL.GetStartedScreen.startWithTrialAccount()}
      primaryButtonOnPress={createAndLogin}
      primaryButtonLoading={loading}
      primaryButtonDisabled={loading}
      secondaryButtonTitle={LL.GetStartedScreen.registerPhoneAccount()}
      secondaryButtonOnPress={navigateToPhoneLogin}
    />
  )
}

const LimitItem = ({ text }: { text: LocalizedString }) => {
  const styles = useStyles()

  return (
    <View style={styles.limitRow}>
      <Text type="h2" style={styles.limitText}>
        - {text}
      </Text>
    </View>
  )
}

const useStyles = makeStyles(() => ({
  limitRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  limitText: {
    marginLeft: 12,
  },
  modalBody: {
    rowGap: 8,
  },
}))
