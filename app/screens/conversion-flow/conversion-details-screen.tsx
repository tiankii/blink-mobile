import React, { useEffect, useRef, useState } from "react"
import { Platform, TouchableOpacity, View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"

import { gql } from "@apollo/client"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { Screen } from "@app/components/screen"
import {
  useConversionScreenQuery,
  useRealtimePriceQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { getBtcWallet, getUsdWallet } from "@app/graphql/wallets-utils"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useConvertMoneyDetails } from "@app/screens/conversion-flow/use-convert-money-details"
import {
  lessThan,
  toBtcMoneyAmount,
  toDisplayAmount,
  toUsdMoneyAmount,
  toWalletAmount,
} from "@app/types/amounts"
import { testProps } from "@app/utils/testProps"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { Input, makeStyles, Text, useTheme } from "@rneui/themed"
import Icon from "react-native-vector-icons/Ionicons"
import { CurrencyKeyboard } from "@app/components/currency-keyboard"
import { GaloyCurrencyBubbleText } from "@app/components/atomic/galoy-currency-bubble-text"
import { CurrencyInputModal } from "@app/components/currency-input-modal"
import { AmountInputScreen } from "@app/components/transfer-amount-input"

gql`
  query conversionScreen {
    me {
      id
      defaultAccount {
        id
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
  }
`

export const ConversionDetailsScreen = () => {
  const {
    theme: { colors },
  } = useTheme()

  const styles = useStyles()
  const navigation =
    useNavigation<NavigationProp<RootStackParamList, "conversionDetails">>()

  // forcing price refresh
  useRealtimePriceQuery({
    fetchPolicy: "network-only",
  })

  const { data } = useConversionScreenQuery({
    fetchPolicy: "cache-and-network",
    returnPartialData: true,
  })

  const { LL } = useI18nContext()
  const {
    formatMoneyAmount,
    moneyAmountToDisplayCurrencyString,
    getCurrencySymbol,
    displayCurrency,
  } = useDisplayCurrency()

  const btcWallet = getBtcWallet(data?.me?.defaultAccount?.wallets)
  const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)

  const [inputValues, setInputValues] = useState({
    fromInput: "",
    toInput: "",
    currencyInput: "",
  })

  const [focusedInput, setFocusedInput] = useState<
    "fromInput" | "toInput" | "currencyInput" | null
  >(null)

  const inputRefs = {
    fromInput: useRef(null),
    toInput: useRef(null),
    currencyInput: useRef(null),
  }

  const handleCustomKeyboardPress = (key: string) => {
    if (!focusedInput) return

    setInputValues((prev) => ({
      ...prev,
      [focusedInput]: prev[focusedInput] + key,
    }))
  }

  const {
    fromWallet,
    toWallet,
    setWallets,
    settlementSendAmount,
    setMoneyAmount,
    convertMoneyAmount,
    isValidAmount,
    moneyAmount,
    canToggleWallet,
    toggleWallet,
  } = useConvertMoneyDetails(
    btcWallet && usdWallet
      ? { initialFromWallet: btcWallet, initialToWallet: usdWallet }
      : undefined,
  )

  useEffect(() => {
    if (!fromWallet && btcWallet && usdWallet) {
      setWallets({
        fromWallet: btcWallet,
        toWallet: usdWallet,
      })
    }
  }, [btcWallet, usdWallet, fromWallet, setWallets])

  if (!data?.me?.defaultAccount || !fromWallet) {
    // TODO: proper error handling. non possible event?
    return <></>
  }

  const btcWalletBalance = toBtcMoneyAmount(btcWallet?.balance ?? NaN)
  const usdWalletBalance = toUsdMoneyAmount(usdWallet?.balance ?? NaN)

  const [defaultCurrency, setDefaultCurrency] = useState(displayCurrency)
  const [currencySymbol, setCurrencySymbol] = useState(
    getCurrencySymbol({
      currency: defaultCurrency,
    }),
  )
  console.log(btcWalletBalance)
  console.log(toDisplayAmount({ amount: 10, currencyCode: "BTC" }))

  const fromWalletBalance =
    fromWallet.walletCurrency === WalletCurrency.Btc ? btcWalletBalance : usdWalletBalance
  const toWalletBalance =
    toWallet.walletCurrency === WalletCurrency.Btc ? btcWalletBalance : usdWalletBalance

  const fromWalletBalanceFormatted = formatMoneyAmount({ moneyAmount: fromWalletBalance })
  const fromSatsFormatted =
    fromWallet.walletCurrency === WalletCurrency.Usd &&
    displayCurrency === WalletCurrency.Usd
      ? null
      : moneyAmountToDisplayCurrencyString({
          moneyAmount: fromWalletBalance,
        })

  const toWalletBalanceFormatted = formatMoneyAmount({ moneyAmount: toWalletBalance })
  const toSatsFormatted =
    toWallet.walletCurrency === WalletCurrency.Usd &&
    displayCurrency === WalletCurrency.Usd
      ? null
      : moneyAmountToDisplayCurrencyString({
          moneyAmount: toWalletBalance,
        })

  let amountFieldError: string | undefined = undefined

  if (
    lessThan({
      value: fromWalletBalance,
      lessThan: settlementSendAmount,
    })
  ) {
    amountFieldError = LL.SendBitcoinScreen.amountExceed({
      balance: fromWalletBalanceFormatted,
    })
  }

  const setAmountToBalancePercentage = (percentage: number) => {
    setMoneyAmount(
      toWalletAmount({
        amount: Math.round((fromWallet.balance * percentage) / 100),
        currency: fromWallet.walletCurrency,
      }),
    )
  }

  const moveToNextScreen = () => {
    navigation.navigate("conversionConfirmation", {
      fromWalletCurrency: fromWallet.walletCurrency,
      moneyAmount,
    })
  }

  useEffect(() => {
    setInputValues((prev) => ({
      ...prev,
      fromInput: prev.toInput,
      toInput: prev.fromInput,
    }))
  }, [fromWallet])

  return (
    <Screen preset="fixed">
      <ScrollView style={styles.scrollViewContainer}>
        <View style={styles.walletSelectorContainer}>
          <View style={styles.fromFieldContainer}>
            <Input
              ref={inputRefs.fromInput}
              value={inputValues.fromInput}
              onFocus={() => setFocusedInput("fromInput")}
              onChangeText={(e) => {
                // remove commas for ease of calculation later on
                const val = e.replaceAll(",", "")
                // TODO adjust for currencies that use commas instead of decimals

                // test for string input that can be either numerical or float
                if (/^\d*\.?\d*$/.test(val.trim())) {
                  const num = Number(val)
                  //onPaste(num)
                }
              }}
              showSoftInputOnFocus={false}
              containerStyle={styles.primaryNumberContainer}
              inputStyle={styles.primaryNumberText}
              placeholder={
                fromWallet.walletCurrency === WalletCurrency.Usd &&
                displayCurrency === WalletCurrency.Usd
                  ? "$ 0.00"
                  : "0 SAT"
              }
              placeholderTextColor={colors.grey3}
              inputContainerStyle={styles.primaryNumberInputContainer}
              renderErrorMessage={false}
              autoFocus={
                displayCurrency === WalletCurrency.Usd &&
                defaultCurrency === WalletCurrency.Usd
              }
            />
            <View>
              {fromWallet.walletCurrency === WalletCurrency.Btc ? (
                <GaloyCurrencyBubbleText
                  currency="BTC"
                  textSize="p2"
                  containerSize="medium"
                />
              ) : (
                <GaloyCurrencyBubbleText
                  currency="USD"
                  textSize="p2"
                  containerSize="medium"
                />
              )}

              <View style={styles.walletSelectorBalanceContainer}>
                <Text style={styles.convertText}>{fromWalletBalanceFormatted}</Text>
                <Text style={styles.convertText}>{fromSatsFormatted}</Text>
              </View>
            </View>
          </View>
          <View style={styles.walletSeparator}>
            <View style={styles.line}></View>
            <TouchableOpacity
              style={styles.switchButton}
              disabled={!canToggleWallet}
              onPress={toggleWallet}
            >
              <Icon name="arrow-down-outline" color={colors.primary} size={25} />
            </TouchableOpacity>
          </View>
          <View style={styles.toFieldContainer}>
            <Input
              ref={inputRefs.toInput}
              value={inputValues.toInput}
              onFocus={() => setFocusedInput("toInput")}
              onChangeText={(e) => {
                // remove commas for ease of calculation later on
                const val = e.replaceAll(",", "")
                // TODO adjust for currencies that use commas instead of decimals

                // test for string input that can be either numerical or float
                if (/^\d*\.?\d*$/.test(val.trim())) {
                  const num = Number(val)
                  //onPaste(num)
                }
              }}
              showSoftInputOnFocus={false}
              containerStyle={styles.primaryNumberContainer}
              inputStyle={styles.primaryNumberText}
              placeholder={
                fromWallet.walletCurrency === WalletCurrency.Usd &&
                displayCurrency === WalletCurrency.Usd
                  ? "0 SAT"
                  : "$ 0.00"
              }
              placeholderTextColor={colors.grey3}
              inputContainerStyle={styles.primaryNumberInputContainer}
              renderErrorMessage={false}
            />
            <View>
              {toWallet.walletCurrency === WalletCurrency.Btc ? (
                <GaloyCurrencyBubbleText
                  currency="BTC"
                  textSize="p2"
                  containerSize="medium"
                />
              ) : (
                <GaloyCurrencyBubbleText
                  currency="USD"
                  textSize="p2"
                  containerSize="medium"
                />
              )}

              <View style={styles.walletSelectorBalanceContainer}>
                <Text style={styles.convertText}>{toWalletBalanceFormatted}</Text>
                <Text style={styles.convertText}>{toSatsFormatted}</Text>
              </View>
            </View>
          </View>
        </View>
        {displayCurrency !== WalletCurrency.Usd &&
          defaultCurrency !== WalletCurrency.Usd && (
            <CurrencyInputModal
              ref={inputRefs.currencyInput}
              inputValue={inputValues.currencyInput}
              onFocus={() => setFocusedInput("currencyInput")}
              onChangeText={(e) => {
                // remove commas for ease of calculation later on
                const val = e.replaceAll(",", "")
                // TODO adjust for currencies that use commas instead of decimals

                // test for string input that can be either numerical or float
                if (/^\d*\.?\d*$/.test(val.trim())) {
                  const num = Number(val)
                  //onPaste(num)
                }
              }}
              defaultCurrency={defaultCurrency}
              placeholder={`${currencySymbol} 0`}
              currencySymbol={currencySymbol}
            />
          )}
        <View style={styles.fieldContainer}>
          {/* <AmountInput
            unitOfAccountAmount={moneyAmount}
            walletCurrency={fromWallet.walletCurrency}
            setAmount={setMoneyAmount}
            convertMoneyAmount={convertMoneyAmount}
          /> */}
          {amountFieldError && (
            <View style={styles.errorContainer}>
              <Text color={colors.error}>{amountFieldError}</Text>
            </View>
          )}
        </View>
        <View style={styles.fieldContainer}>
          <View style={styles.percentageContainer}>
            <View style={styles.percentageFieldContainer}>
              <TouchableOpacity
                {...testProps("convert-25%")}
                style={styles.percentageField}
                onPress={() => setAmountToBalancePercentage(25)}
              >
                <Text style={styles.percentageFieldText}>25%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                {...testProps("convert-50%")}
                style={styles.percentageField}
                onPress={() => setAmountToBalancePercentage(50)}
              >
                <Text style={styles.percentageFieldText}>50%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                {...testProps("convert-75%")}
                style={styles.percentageField}
                onPress={() => setAmountToBalancePercentage(75)}
              >
                <Text style={styles.percentageFieldText}>75%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                {...testProps("convert-100%")}
                style={styles.percentageField}
                onPress={() => setAmountToBalancePercentage(100)}
              >
                <Text style={styles.percentageFieldText}>100%</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.keyboardContainer}>
        {/* <CurrencyKeyboard onPress={handleCustomKeyboardPress} /> */}
      </View>
      <AmountInputScreen
        walletCurrency={fromWallet.walletCurrency}
        convertMoneyAmount={convertMoneyAmount}
        setAmount={setMoneyAmount}
        onSetPrimaryCurrencyFormattedAmount={handleCustomKeyboardPress}
      />
      <GaloyPrimaryButton
        title={LL.common.next()}
        containerStyle={styles.buttonContainer}
        disabled={!isValidAmount}
        onPress={moveToNextScreen}
      />
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  scrollViewContainer: {
    flex: 1,
    flexDirection: "column",
    margin: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  toFieldContainer: {
    flexDirection: "row",
    marginTop: 15,
    alignItems: "center",
  },
  walletSelectorContainer: {
    flexDirection: "column",
    backgroundColor: colors.grey5,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  walletSeparator: {
    flexDirection: "row",
    height: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  line: {
    backgroundColor: colors.grey4,
    height: 1,
    flex: 1,
  },
  switchButton: {
    position: "absolute",
    left: 100,
    height: 43,
    width: 43,
    borderRadius: 50,
    elevation: Platform.OS === "android" ? 50 : 0,
    backgroundColor: colors.grey4,
    justifyContent: "center",
    alignItems: "center",
  },
  fromFieldContainer: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  walletSelectorBalanceContainer: {
    marginTop: 5,
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  convertText: {
    textAlign: "right",
  },
  percentageFieldContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
    flexWrap: "wrap",
    gap: 12,
  },
  percentageField: {
    backgroundColor: colors.grey5,
    padding: 10,
    borderRadius: 100,
    alignItems: "center",
    marginVertical: 5,
    minWidth: 50,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  percentageFieldText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  percentageContainer: {
    flexDirection: "row",
    marginTop: 25,
  },
  buttonContainer: { marginHorizontal: 20, marginBottom: 20 },
  errorContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  keyboardContainer: {
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  primaryNumberContainer: {
    flex: 1,
  },
  primaryNumberText: {
    fontSize: 28,
    lineHeight: 32,
    flex: 1,
    fontWeight: "bold",
    padding: 0,
    margin: 0,
  },
  primaryNumberInputContainer: {
    borderBottomWidth: 0,
  },
}))
