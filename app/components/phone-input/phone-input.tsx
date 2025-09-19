import parsePhoneNumber, {
  AsYouType,
  CountryCode as PhoneNumberCountryCode,
  getCountryCallingCode,
} from "libphonenumber-js/mobile"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { View, TouchableOpacity, TextInput } from "react-native"
import CountryPicker, {
  CountryCode,
  DARK_THEME,
  DEFAULT_THEME,
  Flag,
} from "react-native-country-picker-modal"
import { Input, makeStyles, Text, useTheme } from "@rn-vui/themed"
import { testProps } from "@app/utils/testProps"
import useDeviceLocation from "@app/hooks/use-device-location"
import { useSupportedCountriesQuery } from "@app/graphql/generated"
import { IconNode } from "@rn-vui/base"
import Icon from "react-native-vector-icons/Ionicons"

const DEFAULT_COUNTRY_CODE = "SV"
const PLACEHOLDER_PHONE_NUMBER = "123-456-7890"

export type PhoneInputInfo = {
  countryCode: CountryCode
  countryCallingCode: string
  formattedPhoneNumber: string
  rawPhoneNumber: string
}

export type PhoneInputProps = {
  rightIcon?: IconNode
  onChange?: (info: PhoneInputInfo | null) => void
  defaultRawPhoneNumber?: string
  isDisabled?: boolean
  onFocus?: () => void
  onBlur?: () => void
  onResetInput?: () => void
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  rightIcon,
  onChange,
  defaultRawPhoneNumber,
  isDisabled,
  onFocus,
  onBlur,
  onResetInput,
}) => {
  const {
    theme: { mode: themeMode, colors },
  } = useTheme()
  const styles = useStyles()

  const { data } = useSupportedCountriesQuery()

  const [rawPhoneNumber, setRawPhoneNumber] = useState<string>(
    defaultRawPhoneNumber || "",
  )
  const [countryCode, setCountryCode] = useState<PhoneNumberCountryCode | undefined>()
  const phoneInputRef = useRef<TextInput>(null)
  const { countryCode: detectedCountryCode } = useDeviceLocation()

  const { allSupportedCountries } = useMemo(() => {
    const allSupportedCountries = (data?.globals?.supportedCountries.map(
      (country) => country.id,
    ) || []) as CountryCode[]

    return {
      allSupportedCountries,
    }
  }, [data?.globals, detectedCountryCode])

  // setting default country code from IP
  useEffect(() => {
    if (detectedCountryCode) {
      setCountryCode(detectedCountryCode)
    }
  }, [detectedCountryCode])

  const handleCountrySelect = (country: { cca2: string }) => {
    setCountryCode(country.cca2 as PhoneNumberCountryCode)
    setTimeout(() => {
      phoneInputRef.current?.focus()
    }, 100)
  }

  const handleCountryPickerClose = () => {
    setTimeout(() => {
      phoneInputRef.current?.focus()
    }, 300)
  }

  const setPhoneNumber = (number: string) => {
    const parsedPhoneNumber = parsePhoneNumber(number, countryCode)
    if (parsedPhoneNumber?.country) {
      setCountryCode(parsedPhoneNumber.country)
    }
    setRawPhoneNumber(number)
  }

  const phoneInputInfo = useMemo(() => {
    if (!countryCode) return null

    const info = {
      countryCode: countryCode as CountryCode,
      formattedPhoneNumber: new AsYouType(countryCode).input(rawPhoneNumber),
      countryCallingCode: getCountryCallingCode(countryCode),
      rawPhoneNumber,
    }
    return info
  }, [countryCode, rawPhoneNumber])

  useEffect(() => {
    if (onChange) {
      onChange(phoneInputInfo)
    }
  }, [phoneInputInfo, onChange])

  useEffect(() => {
    if (defaultRawPhoneNumber) {
      const parsedPhoneNumber = parsePhoneNumber(defaultRawPhoneNumber, countryCode)
      if (parsedPhoneNumber?.country) {
        setCountryCode(parsedPhoneNumber.country)
        setRawPhoneNumber(defaultRawPhoneNumber)
      }
    }
  }, [defaultRawPhoneNumber])

  const resetPhoneInput = () => {
    if (isDisabled) return
    setRawPhoneNumber("")
    phoneInputRef.current?.focus()
    if (onResetInput) onResetInput()
  }

  return (
    <View style={styles.inputContainer}>
      <CountryPicker
        theme={themeMode === "dark" ? DARK_THEME : DEFAULT_THEME}
        countryCode={(phoneInputInfo?.countryCode || DEFAULT_COUNTRY_CODE) as CountryCode}
        countryCodes={allSupportedCountries as CountryCode[]}
        onSelect={handleCountrySelect}
        onClose={handleCountryPickerClose}
        renderFlagButton={({ countryCode, onOpen }) => {
          return (
            countryCode && (
              <TouchableOpacity
                style={[
                  styles.countryPickerButtonStyle,
                  isDisabled && styles.disabledInput,
                ]}
                onPress={onOpen}
              >
                <Flag countryCode={countryCode} flagSize={24} />
                <Text type="p1">
                  +{getCountryCallingCode(countryCode as PhoneNumberCountryCode)}
                </Text>
              </TouchableOpacity>
            )
          )
        }}
        withCallingCodeButton={true}
        withFilter={true}
        filterProps={{
          autoFocus: true,
        }}
        withCallingCode={true}
      />
      <Input
        {...testProps("telephoneNumber")}
        ref={phoneInputRef}
        placeholder={PLACEHOLDER_PHONE_NUMBER}
        containerStyle={styles.inputComponentContainerStyle}
        inputContainerStyle={[
          styles.inputContainerStyle,
          isDisabled && styles.disabledInput,
          phoneInputRef.current?.isFocused() && styles.borderFocusedInput,
        ]}
        renderErrorMessage={false}
        textContentType="telephoneNumber"
        keyboardType="phone-pad"
        value={phoneInputInfo?.formattedPhoneNumber}
        onChangeText={setPhoneNumber}
        autoFocus={false}
        rightIcon={
          phoneInputInfo?.formattedPhoneNumber ? (
            <Icon
              name="close"
              size={24}
              onPress={resetPhoneInput}
              color={colors.primary}
            />
          ) : (
            rightIcon
          )
        }
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  inputContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 60,
  },
  countryPickerButtonStyle: {
    backgroundColor: colors.grey5,
    borderRadius: 8,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  inputComponentContainerStyle: {
    flex: 1,
    marginLeft: 20,
    paddingLeft: 0,
    paddingRight: 0,
  },
  inputContainerStyle: {
    flex: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 10,
    backgroundColor: colors.grey5,
    borderRadius: 8,
  },
  disabledInput: { opacity: 0.6 },
  borderFocusedInput: {
    borderColor: colors._green,
    borderWidth: 1,
    borderBottomWidth: 1,
  },
}))
