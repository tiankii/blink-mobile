import * as React from "react"
import { useCallback, useEffect, useReducer } from "react"

import { WalletCurrency } from "@app/graphql/generated"
import { CurrencyInfo, useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { ConvertMoneyAmount } from "@app/screens/send-bitcoin-screen/payment-details"
import {
  DisplayCurrency,
  greaterThan,
  isNonZeroMoneyAmount,
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
import {
  IInputValues,
  InputField,
} from "@app/screens/conversion-flow/use-convert-money-details"

export type AmountInputScreenProps = {
  inputValues: IInputValues
  onAmountChange: (amount: MoneyAmount<WalletOrDisplayCurrency>) => void
  walletCurrency?: WalletCurrency
  convertMoneyAmount: ConvertMoneyAmount
  maxAmount?: MoneyAmount<WalletOrDisplayCurrency>
  minAmount?: MoneyAmount<WalletOrDisplayCurrency>
  onSetFormattedAmount: (InputValue: IInputValues) => void
  initialAmount?: MoneyAmount<WalletOrDisplayCurrency>
  focusedInput: InputField | null
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
  inputValues,
  onAmountChange,
  walletCurrency,
  convertMoneyAmount,
  maxAmount,
  minAmount,
  onSetFormattedAmount,
  initialAmount,
  focusedInput,
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

  // const secondaryNewAmount = getSecondaryAmountIfCurrencyIsDifferent({
  //   primaryAmount: newPrimaryAmount,
  //   walletAmount: convertMoneyAmount(newPrimaryAmount, walletCurrency),
  //   displayAmount: convertMoneyAmount(newPrimaryAmount, DisplayCurrency),
  // })

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

  useEffect(() => {
    if (!focusedInput || !inputValues) return

    const numberPadNumber = numberPadState.numberPadNumber
    const formattedAmount = formatNumberPadNumber(numberPadNumber)

    // const newPrimaryAmount1 = numberPadNumberToMoneyAmount({
    //   numberPadNumber,
    //   currency: numberPadState.currency,
    //   currencyInfo,
    // })

    //if (!isNonZeroMoneyAmount(newPrimaryAmount1)) return
    const fromInputAmount = numberPadNumberToMoneyAmount({
      numberPadNumber,
      currency: inputValues.fromInput.amount.currency,
      currencyInfo,
    })
    const toInputAmount = numberPadNumberToMoneyAmount({
      numberPadNumber,
      currency: inputValues.toInput.amount.currency,
      currencyInfo,
    })
    const currencyInputAmount = numberPadNumberToMoneyAmount({
      numberPadNumber,
      currency: inputValues.currencyInput.amount.currency,
      currencyInfo,
    })
    // const secondaryNewAmount = getSecondaryAmountIfCurrencyIsDifferent({
    //   primaryAmount: newPrimaryAmount,
    //   walletAmount: convertMoneyAmount(newPrimaryAmount, WalletCurrency.Btc),
    //   displayAmount: convertMoneyAmount(newPrimaryAmount, DisplayCurrency),
    // })
    // const secondaryNewAmount2 = getSecondaryAmountIfCurrencyIsDifferent({
    //   primaryAmount: newPrimaryAmount,
    //   walletAmount: convertMoneyAmount(newPrimaryAmount, WalletCurrency.Usd),
    //   displayAmount: convertMoneyAmount(newPrimaryAmount, DisplayCurrency),
    // })

    // console.error(newPrimaryAmount)
    // console.error(secondaryNewAmount)
    // console.error(secondaryNewAmount2)

    // const sats = getSecondaryAmountIfCurrencyIsDifferent({
    //   primaryAmount: newPrimaryAmount1,
    //   walletAmount: convertMoneyAmount(newPrimaryAmount1, WalletCurrency.Btc),
    //   displayAmount: convertMoneyAmount(newPrimaryAmount1, DisplayCurrency),
    // })
    // const usd = getSecondaryAmountIfCurrencyIsDifferent({
    //   primaryAmount: newPrimaryAmount1,
    //   walletAmount: convertMoneyAmount(newPrimaryAmount1, WalletCurrency.Usd),
    //   displayAmount: convertMoneyAmount(newPrimaryAmount1, DisplayCurrency),
    // })

    const fbtc = formatMoneyAmount({ moneyAmount: fromInputAmount })
    const fto = formatMoneyAmount({ moneyAmount: toInputAmount, isApproximate: true })
    const fcur = formatMoneyAmount({ moneyAmount: currencyInputAmount })
    console.warn(formattedAmount)
    console.warn(fbtc)
    console.warn(fto)
    console.warn(fcur)

    onSetFormattedAmount({
      formattedAmount,
      fromInput: {
        id: "fromInput",
        currency: inputValues.fromInput.amount.currency,
        formattedAmount: formattedAmount ? fbtc : "",
        isFocused: focusedInput.id === "fromInput",
        amount: fromInputAmount,
      },
      toInput: {
        id: "toInput",
        currency: inputValues.toInput.amount.currency,
        formattedAmount: formattedAmount ? fto : "",
        isFocused: focusedInput.id === "toInput",
        amount: toInputAmount,
      },
      currencyInput: {
        id: "currencyInput",
        currency: inputValues.currencyInput.amount.currency,
        formattedAmount: formattedAmount ? fcur : "",
        isFocused: focusedInput.id === "currencyInput",
        amount: currencyInputAmount,
      },
    })

    // console.log(fromInputAmount)
    // console.log(toInputAmount)
    // console.log(currencyInputAmount)
    // console.error(formattedAmount)

    // console.warn(sats)
    // console.warn(usd)

    // console.error(fbtc)
    // console.error(fto)
    // console.error(fcur)

    // const t1 = convertMoneyAmount(fromInputAmount, DisplayCurrency)
    // const t2 = convertMoneyAmount(toInputAmount, DisplayCurrency)
    // const t3 = convertMoneyAmount(currencyInputAmount, DisplayCurrency)
    // console.log(t1)
    // console.log(t2)
    // console.log(t3)

    // console.log({
    //   id: focusedInput.id,
    //   formattedAmount,
    //   amount: primaryFocusedAmount,
    // })

    //onAmountChange(primaryAmount)
  }, [
    numberPadState.numberPadNumber,
    numberPadState.currency,
    currencyInfo,
    //onAmountChange,
    onSetFormattedAmount,
    focusedInput,
    inputValues,
  ])

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

  return (
    <AmountInputScreenUI
      onPaste={onPaste}
      onClearAmount={onClear}
      errorMessage={errorMessage}
      onKeyPress={onKeyPress}
    />
  )
}
