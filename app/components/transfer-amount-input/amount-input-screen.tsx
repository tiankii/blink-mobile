import * as React from "react"
import { useCallback, useEffect, useReducer } from "react"

import { WalletCurrency } from "@app/graphql/generated"
import { CurrencyInfo, useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { ConvertMoneyAmount } from "@app/screens/send-bitcoin-screen/payment-details"
import {
  DisplayCurrency,
  greaterThan,
  lessThan,
  MoneyAmount,
  WalletOrDisplayCurrency,
} from "@app/types/amounts"

import { AmountInputScreenUI } from "./amount-input-screen-ui"
import {
  Key,
  NumberPadNumber,
  numberPadReducer,
  NumberPadReducerActionType,
  NumberPadReducerState,
} from "../amount-input-screen/number-pad-reducer"

export type AmountInputScreenProps = {
  setAmount: (amount: MoneyAmount<WalletOrDisplayCurrency>) => void
  walletCurrency: WalletCurrency
  convertMoneyAmount: ConvertMoneyAmount
  maxAmount?: MoneyAmount<WalletOrDisplayCurrency>
  minAmount?: MoneyAmount<WalletOrDisplayCurrency>
  onSetPrimaryCurrencyFormattedAmount: (amount: string) => void
  initialAmount?: MoneyAmount<WalletOrDisplayCurrency>
}

const formatNumberPadNumber = (numberPadNumber: NumberPadNumber) => {
  const { majorAmount, minorAmount, hasDecimal } = numberPadNumber

  if (!majorAmount && !minorAmount && !hasDecimal) {
    return ""
  }

  const formattedMajorAmount = Number(majorAmount).toLocaleString()

  if (hasDecimal) {
    return `${formattedMajorAmount}.${minorAmount}`
  }

  return formattedMajorAmount
}

const numberPadNumberToMoneyAmount = ({
  numberPadNumber,
  currency,
  currencyInfo,
}: {
  numberPadNumber: NumberPadNumber
  currency: WalletOrDisplayCurrency
  currencyInfo: Record<WalletOrDisplayCurrency, CurrencyInfo>
}): MoneyAmount<WalletOrDisplayCurrency> => {
  const { majorAmount, minorAmount } = numberPadNumber
  const { minorUnitToMajorUnitOffset, currencyCode } = currencyInfo[currency]

  const majorAmountInMinorUnit =
    Math.pow(10, minorUnitToMajorUnitOffset) * Number(majorAmount)

  // if minorUnitToMajorUnitOffset is 2, slice 234354 to 23
  const slicedMinorAmount = minorAmount.slice(0, minorUnitToMajorUnitOffset)
  // if minorAmount is 4 and minorUnitToMajorUnitOffset is 2, then missing zeros is 1
  const minorAmountMissingZeros = minorUnitToMajorUnitOffset - slicedMinorAmount.length

  const amount =
    majorAmountInMinorUnit + Number(minorAmount) * Math.pow(10, minorAmountMissingZeros)

  return {
    amount,
    currency,
    currencyCode,
  }
}

const moneyAmountToNumberPadReducerState = ({
  moneyAmount,
  currencyInfo,
}: {
  moneyAmount: MoneyAmount<WalletOrDisplayCurrency>
  currencyInfo: ReturnType<typeof useDisplayCurrency>["currencyInfo"]
}): NumberPadReducerState => {
  const amountString = moneyAmount.amount.toString()
  const { minorUnitToMajorUnitOffset, showFractionDigits } =
    currencyInfo[moneyAmount.currency]

  let numberPadNumber: NumberPadNumber

  if (amountString === "0") {
    numberPadNumber = {
      majorAmount: "",
      minorAmount: "",
      hasDecimal: false,
    }
  } else if (amountString.length <= minorUnitToMajorUnitOffset) {
    numberPadNumber = {
      majorAmount: "0",
      minorAmount: showFractionDigits
        ? amountString.padStart(minorUnitToMajorUnitOffset, "0")
        : "",
      hasDecimal: showFractionDigits,
    }
  } else {
    numberPadNumber = {
      majorAmount: amountString.slice(
        0,
        amountString.length - minorUnitToMajorUnitOffset,
      ),
      minorAmount: showFractionDigits
        ? amountString.slice(amountString.length - minorUnitToMajorUnitOffset)
        : "",
      hasDecimal: showFractionDigits && minorUnitToMajorUnitOffset > 0,
    }
  }

  return {
    numberPadNumber,
    numberOfDecimalsAllowed: showFractionDigits ? minorUnitToMajorUnitOffset : 0,
    currency: moneyAmount.currency,
  }
}

export const AmountInputScreen: React.FC<AmountInputScreenProps> = ({
  setAmount,
  walletCurrency,
  convertMoneyAmount,
  maxAmount,
  minAmount,
  onSetPrimaryCurrencyFormattedAmount,
  initialAmount,
}) => {
  const {
    currencyInfo,
    getSecondaryAmountIfCurrencyIsDifferent,
    formatMoneyAmount,
    zeroDisplayAmount,
  } = useDisplayCurrency()

  const { LL } = useI18nContext()

  const [numberPadState, dispatchNumberPadAction] = useReducer(
    numberPadReducer,
    moneyAmountToNumberPadReducerState({
      moneyAmount: zeroDisplayAmount,
      currencyInfo,
    }),
  )

  const newPrimaryAmount = numberPadNumberToMoneyAmount({
    numberPadNumber: numberPadState.numberPadNumber,
    currency: numberPadState.currency,
    currencyInfo,
  })

  const secondaryNewAmount = getSecondaryAmountIfCurrencyIsDifferent({
    primaryAmount: newPrimaryAmount,
    walletAmount: convertMoneyAmount(newPrimaryAmount, walletCurrency),
    displayAmount: convertMoneyAmount(newPrimaryAmount, DisplayCurrency),
  })

  const onKeyPress = (key: Key) => {
    dispatchNumberPadAction({
      action: NumberPadReducerActionType.HandleKeyPress,
      payload: {
        key,
      },
    })
  }

  const onPaste = (keys: number) => {
    dispatchNumberPadAction({
      action: NumberPadReducerActionType.HandlePaste,
      payload: {
        keys,
      },
    })
  }

  const onClear = () => {
    dispatchNumberPadAction({
      action: NumberPadReducerActionType.ClearAmount,
    })
  }

  const setNumberPadAmount = useCallback(
    (amount: MoneyAmount<WalletOrDisplayCurrency>) => {
      dispatchNumberPadAction({
        action: NumberPadReducerActionType.SetAmount,
        payload: moneyAmountToNumberPadReducerState({
          moneyAmount: amount,
          currencyInfo,
        }),
      })
    },
    [currencyInfo],
  )

  useEffect(() => {
    if (initialAmount) {
      setNumberPadAmount(initialAmount)
    }
  }, [initialAmount, setNumberPadAmount])

  let errorMessage = ""
  const maxAmountInPrimaryCurrency =
    maxAmount && convertMoneyAmount(maxAmount, newPrimaryAmount.currency)
  const minAmountInPrimaryCurrency =
    minAmount && convertMoneyAmount(minAmount, newPrimaryAmount.currency)

  if (
    maxAmountInPrimaryCurrency &&
    greaterThan({
      value: convertMoneyAmount(newPrimaryAmount, maxAmountInPrimaryCurrency.currency),
      greaterThan: maxAmountInPrimaryCurrency,
    })
  ) {
    errorMessage = LL.AmountInputScreen.maxAmountExceeded({
      maxAmount: formatMoneyAmount({ moneyAmount: maxAmountInPrimaryCurrency }),
    })
  } else if (
    minAmountInPrimaryCurrency &&
    newPrimaryAmount.amount &&
    lessThan({
      value: convertMoneyAmount(newPrimaryAmount, minAmountInPrimaryCurrency.currency),
      lessThan: minAmountInPrimaryCurrency,
    })
  ) {
    errorMessage = LL.AmountInputScreen.minAmountNotMet({
      minAmount: formatMoneyAmount({ moneyAmount: minAmountInPrimaryCurrency }),
    })
  }

  // useEffect(() => {
  //   console.log(numberPadState.numberPadNumber)
  //   onSetPrimaryCurrencyFormattedAmount(
  //     formatNumberPadNumber(numberPadState.numberPadNumber),
  //   )
  //   setAmount(newPrimaryAmount)
  //   console.log(newPrimaryAmount)
  // }, [numberPadState])

  return (
    <AmountInputScreenUI
      // primaryCurrencyFormattedAmount={formatNumberPadNumber(
      //   numberPadState.numberPadNumber,
      // )}
      onPaste={onPaste}
      onClearAmount={onClear}
      errorMessage={errorMessage}
      onKeyPress={onKeyPress}
      // onSetAmountPress={setAmount && (() => setAmount(newPrimaryAmount))}
    />
  )
}
