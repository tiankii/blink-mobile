import * as React from "react"

import { useI18nContext } from "@app/i18n/i18n-react"
import { testProps } from "@app/utils/testProps"

import { ExpirationTimeButton } from "./expiration-time-button"
import { ExpirationTimeModal } from "./expiration-time-modal"
import { StyleProp, ViewStyle } from "react-native"
import { WalletCurrency } from "@app/graphql/generated"

export type ExpirationTimeInputProps = {
  expirationTime: number
<<<<<<< HEAD
=======
  expiresAt?: Date | null
>>>>>>> 32a28abef2a011e1a783a0e0dee7095e92943d37
  setExpirationTime?: (expirationTime: number) => void
  walletCurrency: WalletCurrency
  disabled: boolean
  big?: boolean
  style?: StyleProp<ViewStyle>
}

export const ExpirationTimeChooser: React.FC<ExpirationTimeInputProps> = ({
  expirationTime,
<<<<<<< HEAD
=======
  expiresAt,
>>>>>>> 32a28abef2a011e1a783a0e0dee7095e92943d37
  setExpirationTime,
  walletCurrency,
  disabled,
  big,
  style,
}) => {
  const [openModal, setOpenModal] = React.useState(false)
  const { LL } = useI18nContext()

  const onSetExpirationTime = (expirationTime: number) => {
    setExpirationTime && setExpirationTime(expirationTime)
    setOpenModal(false)
  }

<<<<<<< HEAD
  if (openModal) {
    return (
      <ExpirationTimeModal
        value={expirationTime}
=======
  const getRemainMinutes = (expiresAt?: Date | null) => {
    const currentTime = new Date()

    if (!expiresAt) return 0
    const remainingSeconds = Math.floor(
      (expiresAt.getTime() - currentTime.getTime()) / 1000,
    )
    return Math.ceil(remainingSeconds / 60)
  }

  if (openModal) {
    return (
      <ExpirationTimeModal
        value={expirationTime > 0 ? expirationTime : getRemainMinutes(expiresAt)}
>>>>>>> 32a28abef2a011e1a783a0e0dee7095e92943d37
        isOpen={true}
        onSetExpirationTime={onSetExpirationTime}
        close={() => setOpenModal(false)}
        walletCurrency={walletCurrency}
      />
    )
  }

<<<<<<< HEAD
  const getExpirationTimeFormat = (timeIn: { minutes?: number }) => {
    let minutes = timeIn.minutes ?? 0
    if (minutes === 0) return null

=======
  const getExpirationTimeFormat = (timeIn: {
    expiresAt?: Date | null
    minutes?: number
  }) => {
    let minutes = timeIn.minutes ?? 0

    if (timeIn?.expiresAt) {
      minutes = getRemainMinutes(timeIn.expiresAt)
    }
>>>>>>> 32a28abef2a011e1a783a0e0dee7095e92943d37
    const unidades = [
      { umbral: 1440, singular: LL.common.day.one(), plural: LL.common.day.other() },
      { umbral: 60, singular: LL.common.hour(), plural: LL.common.hours() },
      { umbral: 1, singular: LL.common.minute(), plural: LL.common.minutes() },
    ]

    for (const unidad of unidades) {
      if (minutes >= unidad.umbral) {
        const cantidad = Math.floor(minutes / unidad.umbral)
        return `${cantidad} ${cantidad === 1 ? unidad.singular : unidad.plural}`
      }
    }

    return `${minutes} ${LL.common.minutes()}`
  }

  const onPressInputButton = () => {
    if (disabled) return
    setOpenModal(true)
  }

  return (
    <ExpirationTimeButton
      placeholder={LL.common.expirationTime()}
      onPress={onPressInputButton}
<<<<<<< HEAD
      value={getExpirationTimeFormat({ minutes: expirationTime })}
=======
      value={
        expirationTime > 0
          ? getExpirationTimeFormat({ minutes: expirationTime })
          : getExpirationTimeFormat({ expiresAt })
      }
>>>>>>> 32a28abef2a011e1a783a0e0dee7095e92943d37
      disabled={disabled}
      iconName="pencil"
      primaryTextTestProps={"Expiration time input button"}
      big={big}
      style={style}
      {...testProps("Expiration time button")}
    />
  )
}
