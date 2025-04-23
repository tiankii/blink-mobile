import { useCallback, useRef, useState } from "react"
import { Linking } from "react-native"
import axios, { isAxiosError } from "axios"

import analytics from "@react-native-firebase/analytics"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"

import { PhoneValidationStackParamList } from "@app/navigation/stack-param-lists"
import { formatPublicKey } from "@app/utils/format-public-key"
import { useAppConfig } from "@app/hooks"
import { BLINK_DEEP_LINK_PREFIX } from "@app/config"

type TelegramAuthData = {
  bot_id: string
  scope: {
    data: string[]
    v: number
  }
  public_key: string
  nonce: string
}

export const useTelegramLogin = (phone: string) => {
  const navigation = useNavigation<StackNavigationProp<PhoneValidationStackParamList>>()
  const { saveToken } = useAppConfig()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authData, setAuthData] = useState<TelegramAuthData | null>(null)
  const [isPollingForAuth, setIsPollingForAuth] = useState(false)

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasLoggedInRef = useRef(false)

  const {
    appConfig: {
      galoyInstance: { authUrl },
    },
  } = useAppConfig()

  const clearPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
      setIsPollingForAuth(false)
    }
  }

  const getTelegramPassportRequestParams = useCallback(async () => {
    try {
      const url = `${authUrl}/auth/telegram-passport/request-params`
      const { data } = await axios.post(url, { phone })
      return data
    } catch (err) {
      throw new Error(
        isAxiosError(err) && typeof err.response?.data?.error === "string"
          ? err.response.data.error
          : "Failed to fetch Telegram auth params",
      )
    }
  }, [authUrl, phone])

  const loginWithTelegramPassport = useCallback(
    async (nonce: string) => {
      try {
        const url = `${authUrl}/auth/telegram-passport/login`
        const { data } = await axios.post(url, { phone, nonce })
        return data
      } catch (err) {
        throw new Error(
          isAxiosError(err) && typeof err.response?.data?.error === "string"
            ? err.response.data.error
            : "Failed to fetch Telegram login",
        )
      }
    },
    [authUrl, phone],
  )

  const checkIfAuthorized = useCallback(
    async (nonce: string) => {
      if (hasLoggedInRef.current) return
      let alreadyLoggedIn = false

      try {
        const result = await loginWithTelegramPassport(nonce)
        if (!result?.authToken || hasLoggedInRef.current) return

        alreadyLoggedIn = true
        hasLoggedInRef.current = true
        clearPolling()
        analytics().logLogin({ method: "telegram" })

        if (result.totpRequired) {
          navigation.navigate("totpLoginValidate", { authToken: result.authToken })
          return
        }

        saveToken(result.authToken)
        navigation.replace("Primary")
      } catch (e) {
        const message = (e as Error).message
        if (message.includes("Authorization data from Telegram is still pending.")) return

        clearPolling()
        setError(message)
        if (alreadyLoggedIn) hasLoggedInRef.current = true
      }
    },
    [navigation, saveToken, loginWithTelegramPassport],
  )

  useFocusEffect(
    useCallback(() => {
      if (!authData?.nonce) return

      const handleDeepLink = ({ url }: { url: string }) => {
        const cleanUrl = url.replace(`${BLINK_DEEP_LINK_PREFIX}/`, "")
        const [path, query] = cleanUrl.split("&")
        if (path !== "passport-callback") return

        const params = new URLSearchParams(query)
        if (params.get("tg_passport") === "success") {
          clearPolling()
          setIsPollingForAuth(true)
          pollingIntervalRef.current = setInterval(
            () => checkIfAuthorized(authData.nonce),
            5000,
          )
        }
      }

      const sub = Linking.addEventListener("url", handleDeepLink)

      return () => {
        sub.remove()
        clearPolling()
      }
    }, [authData, checkIfAuthorized]),
  )

  const handleTelegramLogin = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)

      const data = await getTelegramPassportRequestParams()
      setAuthData(data)

      const scope = encodeURIComponent(JSON.stringify(data.scope))
      const publicKey = encodeURIComponent(formatPublicKey(data.public_key))
      const callback = encodeURIComponent(`${BLINK_DEEP_LINK_PREFIX}/passport-callback`)

      const deepLink = `tg://passport?bot_id=${data.bot_id}&scope=${scope}&public_key=${publicKey}&nonce=${data.nonce}&callback_url=${callback}`
      const fallbackLink = `https://telegram.me/telegrampassport?bot_id=${data.bot_id}&scope=${scope}&public_key=${publicKey}&nonce=${data.nonce}&callback_url=${callback}`

      clearPolling()

      const canOpen = await Linking.canOpenURL(deepLink)
      await Linking.openURL(canOpen ? deepLink : fallbackLink).catch(() => {
        setError("Failed to open Telegram. Please make sure the app is installed.")
      })
    } catch (err) {
      setError((err as Error).message || "Unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [getTelegramPassportRequestParams])

  return {
    loading,
    error,
    isPollingForAuth,
    handleTelegramLogin,
  }
}
