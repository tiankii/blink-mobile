import React, { ReactNode } from "react"
import {
  Platform,
  View,
  TouchableOpacity,
  StyleSheet,
  DimensionValue,
} from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import Modal from "react-native-modal"

import { makeStyles, Text, TextProps, useTheme } from "@rneui/themed"

import { GaloyIcon } from "../atomic/galoy-icon"
import { GaloyPrimaryButton } from "../atomic/galoy-primary-button"
import { GaloySecondaryButton } from "../atomic/galoy-secondary-button"

export type CustomModalProps = {
  isVisible: boolean
  toggleModal: () => void
  image?: ReactNode
  headerTitle?: string
  headerTitleSize?: TextProps["type"]
  title?: string
  body: ReactNode
  primaryButtonTitle: string
  primaryButtonTextAbove?: string
  nonScrollingContent?: ReactNode
  primaryButtonOnPress: () => void
  primaryButtonLoading?: boolean
  primaryButtonDisabled?: boolean
  secondaryButtonTitle?: string
  secondaryButtonOnPress?: () => void
  secondaryButtonLoading?: boolean
  showCloseIconButton?: boolean
  minHeight?: DimensionValue
  titleMaxWidth?: DimensionValue
  titleTextAlignment?: "auto" | "center" | "left" | "right" | "justify"
  backgroundModalColor?: string
}

const CustomModal: React.FC<CustomModalProps> = ({
  isVisible,
  toggleModal,
  image,
  headerTitle,
  headerTitleSize,
  title,
  body,
  minHeight,
  titleMaxWidth,
  titleTextAlignment,
  primaryButtonTitle,
  nonScrollingContent,
  primaryButtonOnPress,
  primaryButtonTextAbove,
  primaryButtonLoading,
  primaryButtonDisabled,
  secondaryButtonTitle,
  secondaryButtonOnPress,
  secondaryButtonLoading,
  showCloseIconButton = true,
  backgroundModalColor,
}) => {
  const styles = useStyles({
    hasPrimaryButtonTextAbove: Boolean(primaryButtonTextAbove),
    minHeight,
    titleMaxWidth,
    titleTextAlignment,
    showCloseIconButton,
    backgroundModalColor,
    /* eslint @typescript-eslint/ban-ts-comment: "off" */
    // @ts-ignore-next-line no-implicit-any error
  }) as StyleSheet.NamedStyles
  const {
    theme: { mode, colors },
  } = useTheme()
  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.8}
      backdropColor={colors.white}
      backdropTransitionOutTiming={0}
      avoidKeyboard={true}
      onBackdropPress={toggleModal}
    >
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          {headerTitle ? (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.headerTitle}
              type={headerTitleSize || "h1"}
            >
              {headerTitle}
            </Text>
          ) : (
            <View></View>
          )}

          {showCloseIconButton && (
            <TouchableOpacity onPress={toggleModal}>
              <GaloyIcon name="close" size={30} color={colors.grey0} />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          style={styles.modalCard}
          persistentScrollbar={true}
          indicatorStyle={mode === "dark" ? "white" : "black"}
          bounces={false}
          contentContainerStyle={styles.scrollViewContainer}
        >
          {image && <View style={styles.imageContainer}>{image}</View>}
          {title && (
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitleText}>{title}</Text>
            </View>
          )}
          <View style={styles.modalBodyContainer}>{body}</View>
        </ScrollView>
        {nonScrollingContent}
        <View style={styles.modalActionsContainer}>
          <View>
            {primaryButtonTextAbove && (
              <Text style={styles.primaryButtonTextAbove} type="p3">
                {primaryButtonTextAbove}
              </Text>
            )}
            <GaloyPrimaryButton
              title={primaryButtonTitle}
              onPress={primaryButtonOnPress}
              loading={primaryButtonLoading}
              disabled={primaryButtonDisabled}
            />
          </View>
          {secondaryButtonTitle && secondaryButtonOnPress && (
            <GaloySecondaryButton
              title={secondaryButtonTitle}
              loading={secondaryButtonLoading}
              onPress={secondaryButtonOnPress}
            />
          )}
        </View>
      </View>
    </Modal>
  )
}

export default CustomModal

type UseStylesProps = {
  hasPrimaryButtonTextAbove: boolean
  showCloseIconButton: boolean
  minHeight?: DimensionValue
  titleTextAlignment?: "auto" | "center" | "left" | "right" | "justify"
  titleMaxWidth?: DimensionValue
  backgroundModalColor?: string
}

const useStyles = makeStyles(({ colors }, props: UseStylesProps) => ({
  container: {
    backgroundColor: props.backgroundModalColor ?? colors.grey5,
    maxHeight: "95%",
    minHeight: props.minHeight || "auto",
    borderRadius: 16,
    padding: 20,
  },
  modalCard: {
    width: "100%",
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
    paddingTop: props.showCloseIconButton ? 0 : 20,
  },
  modalTitleContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10,
  },
  modalTitleText: {
    fontSize: 24,
    fontWeight: Platform.OS === "ios" ? "600" : "700",
    lineHeight: 32,
    maxWidth: props.titleMaxWidth || "80%",
    textAlign: props.titleTextAlignment || "center",
    color: colors.black,
  },
  modalBodyContainer: {
    flex: 1,
    flexGrow: 1,
  },
  scrollViewContainer: { flexGrow: 1 },
  modalBodyText: {
    fontSize: 20,
    fontWeight: "400",
    lineHeight: 24,
    textAlign: "center",
    maxWidth: "80%",
  },
  primaryButtonTextAbove: {
    textAlign: "center",
    paddingVertical: 8,
  },
  modalActionsContainer: {
    width: "100%",
    height: "auto",
    flexDirection: "column",
    rowGap: 12,
    marginTop: props.hasPrimaryButtonTextAbove ? 0 : 20,
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTitle: {
    flexShrink: 1,
    flexGrow: 1,
    marginRight: 10,
  },
}))
