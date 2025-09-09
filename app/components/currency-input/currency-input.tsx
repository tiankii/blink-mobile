import React, { forwardRef, useImperativeHandle, useRef, useCallback } from "react"
import {
  View,
  TextInput,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TargetedEvent,
  TouchableOpacity,
  Animated,
  StyleProp,
  ViewStyle,
} from "react-native"
import { Input, Text, useTheme, makeStyles } from "@rneui/themed"

import { testProps } from "@app/utils/testProps"

type AnimatedViewStyle = Animated.WithAnimatedValue<StyleProp<ViewStyle>>

type CurrencyInputProps = {
  placeholder?: string
  currency: string
  value?: string
  onChangeText: (text: string) => void
  onFocus?: ((e: NativeSyntheticEvent<TextInputFocusEventData>) => void) &
    ((event: NativeSyntheticEvent<TargetedEvent>) => void)
  isFocused?: boolean
  rightIcon?: React.ReactNode
  testId?: string
  autoFocus?: boolean
  AnimatedViewStyle?: AnimatedViewStyle
}

export const CurrencyInput = forwardRef<TextInput, CurrencyInputProps>(
  (
    {
      placeholder,
      currency,
      value,
      onChangeText,
      onFocus,
      rightIcon,
      testId,
      autoFocus = false,
      isFocused = false,
      AnimatedViewStyle,
    },
    ref,
  ) => {
    const {
      theme: { colors },
    } = useTheme()
    const styles = useStyles(isFocused)
    const inputRef = useRef<TextInput>(null)

    useImperativeHandle(ref, () => inputRef.current as TextInput)

    const getEndSelection = useCallback(() => {
      const text = value ?? ""
      const pos = text.length
      return { start: pos, end: pos } as const
    }, [value])

    const handleOverlayPress = useCallback(() => {
      const text = value ?? ""
      const pos = text.length
      inputRef.current?.focus()
      inputRef.current?.setNativeProps({ selection: { start: pos, end: pos } })
    }, [value])

    const resolvedRightIcon = React.isValidElement(rightIcon) ? (
      <View style={styles.rightIconBox}>{rightIcon}</View>
    ) : (
      <View style={styles.rightIconSpacer} />
    )

    return (
      <Animated.View style={[styles.containerBase, AnimatedViewStyle]}>
        <View style={styles.contentContainer}>
          <View style={styles.inputSection}>
            <Input
              ref={inputRef}
              value={value}
              onFocus={onFocus}
              onChangeText={onChangeText}
              showSoftInputOnFocus={false}
              inputStyle={styles.inputText}
              placeholder={placeholder}
              placeholderTextColor={colors.grey3}
              inputContainerStyle={styles.inputContainer}
              renderErrorMessage={false}
              autoFocus={autoFocus}
              rightIcon={resolvedRightIcon}
              rightIconContainerStyle={styles.rightIconContainer}
              selection={getEndSelection()}
              pointerEvents="none"
              {...(testId ? testProps(testId) : {})}
            />
            <TouchableOpacity
              style={styles.inputOverlay}
              activeOpacity={1}
              onPress={handleOverlayPress}
            />
          </View>

          <View style={styles.currencyBadge}>
            <Text
              type="p2"
              numberOfLines={1}
              ellipsizeMode="middle"
              style={styles.currencyText}
            >
              {currency}
            </Text>
          </View>
        </View>
      </Animated.View>
    )
  },
)

CurrencyInput.displayName = "CurrencyInput"

const useStyles = makeStyles(({ colors }) => ({
  containerBase: {
    paddingVertical: 10,
    paddingRight: 15,
    paddingLeft: 5,
    borderRadius: 13,
    backgroundColor: colors.grey5,
    justifyContent: "center",
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputSection: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  inputOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  inputText: {
    fontSize: 20,
    lineHeight: 24,
    flex: 1,
    padding: 0,
    margin: 0,
  },
  inputContainer: {
    borderBottomWidth: 0,
  },
  rightIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  rightIconBox: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  rightIconSpacer: {
    width: 30,
    height: 30,
  },
  currencyBadge: {
    borderColor: colors._white,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  currencyText: {
    color: colors._white,
  },
}))
