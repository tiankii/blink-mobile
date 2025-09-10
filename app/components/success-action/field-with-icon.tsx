import React from "react"
import { View, Text, Linking } from "react-native"
import { makeStyles } from "@rneui/themed"
import { FieldWithEventProps } from "./field-with-icon.props"
import { useI18nContext } from "@app/i18n/i18n-react"
import { testProps } from "@app/utils/testProps"

type TTextWithUrl = {
  text: string
  url?: string
}

export const FieldWithEvent = ({ title, value, subValue }: FieldWithEventProps) => {
  const styles = useStyles()
  const { LL } = useI18nContext()

  const handleTextWithUrl = (text: string): TTextWithUrl => {
    const regex = /(https?:\/\/[^\s]+)/i
    const match = text.match(regex)
    if (match) {
      const url = match[0]
      const textWithoutURL = text.replace(url, "").trim()
      return { text: textWithoutURL, url }
    }
    return { text }
  }

  const textData = handleTextWithUrl(value)

  return (
    <View style={styles.successActionFieldContainer}>
      <Text style={styles.titleFieldBackground}>{title}</Text>
      <View style={styles.fieldBackground}>
        <View>
          <Text style={styles.inputStyle}>
            {textData.text}
            {textData.url && " "}
            {textData.url && (
              <Text
                {...testProps(LL.ScanningQRCodeScreen.openLinkTitle())}
                style={styles.inputUlr}
                onPress={() => Linking.openURL(textData.url!)}
              >
                {textData.url}
              </Text>
            )}
          </Text>
          {subValue && (
            <Text
              style={[styles.inputStyle, styles.subValueStyle]}
            >{`(${subValue})`}</Text>
          )}
        </View>
      </View>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  successActionFieldContainer: {
    flexDirection: "row",
    overflow: "hidden",
    alignItems: "flex-start",
  },
  titleFieldBackground: {
    fontSize: 14,
    fontWeight: "300",
    fontStyle: "normal",
    color: colors.black,
    minWidth: 80,
  },
  fieldBackground: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    fontSize: 14,
    color: colors.black,
  },
  inputStyle: {
    fontSize: 14,
    color: colors.black,
    textAlign: "right",
  },
  inputUlr: {
    fontSize: 14,
    color: colors.primary,
  },
  subValueStyle: {
    marginTop: 2,
  },
}))
