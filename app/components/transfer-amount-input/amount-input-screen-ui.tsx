import * as React from "react"
import { View } from "react-native"

import { makeStyles } from "@rneui/themed"

import { GaloyErrorBox } from "../atomic/galoy-error-box"
import { CurrencyKeyboard } from "../currency-keyboard"
import { Key } from "../amount-input-screen/number-pad-reducer"

export type AmountInputScreenUIProps = {
  errorMessage?: string
  onKeyPress: (key: Key) => void
  onClearAmount: () => void
  onPaste: (keys: number) => void
}

export const AmountInputScreenUI: React.FC<AmountInputScreenUIProps> = ({
  errorMessage,
  onKeyPress,
}) => {
  const styles = useStyles()

  return (
    <View style={styles.amountInputScreenContainer}>
      <View style={styles.bodyContainer}>
        <View style={styles.infoContainer}>
          {errorMessage && <GaloyErrorBox errorMessage={errorMessage} />}
        </View>
        <View style={styles.keyboardContainer}>
          <CurrencyKeyboard onPress={onKeyPress} />
        </View>
      </View>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  amountInputScreenContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomColor: colors.primary4,
    borderBottomWidth: 1,
  },
  amountContainer: {
    marginBottom: 16,
  },
  primaryNumberContainer: {
    flex: 1,
  },
  primaryAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  primaryCurrencySymbol: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "bold",
  },
  primaryNumberText: {
    fontSize: 28,
    lineHeight: 32,
    flex: 1,
    fontWeight: "bold",
  },
  primaryNumberInputContainer: {
    borderBottomWidth: 0,
  },
  primaryCurrencyCodeText: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "bold",
    textAlign: "right",
  },
  secondaryAmountContainer: {
    flexDirection: "row",
  },
  secondaryAmountText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "bold",
    flex: 1,
  },
  secondaryAmountCurrencyCodeText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "bold",
  },
  swapContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 8,
  },
  horizontalLine: {
    borderBottomColor: colors.primary4,
    borderBottomWidth: 1,
    flex: 1,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  bodyContainer: {
    flex: 1,
    padding: 24,
  },
  buttonContainer: {},
  keyboardContainer: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
}))
