import * as React from "react"
import { makeStyles, Text } from "@rn-vui/themed"
import { ScrollView, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { useI18nContext } from "@app/i18n/i18n-react"

import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { circleDiameterThatContainsSquare } from "@app/components/atomic/galoy-icon"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { Screen } from "../../components/screen"

interface Step {
  title: string
  description: string
}

interface StepItemProps {
  step: Step
  isCurrentStep: boolean
  stepNumber: number
}

const StepItem: React.FC<StepItemProps> = ({ step, isCurrentStep, stepNumber }) => {
  const styles = useStyles()

  return (
    <View style={styles.stepContainer}>
      <View
        style={[styles.stepNumberCircle, isCurrentStep && styles.stepNumberCircleActive]}
      >
        <Text
          type="p2"
          style={[styles.stepNumberText, isCurrentStep && styles.stepNumberTextActive]}
        >
          {stepNumber}
        </Text>
      </View>
      <View style={styles.stepContent}>
        <Text type="p1" bold style={styles.stepTitle}>
          {step.title}
        </Text>
        <Text type="p3" style={styles.stepDescription}>
          {step.description}
        </Text>
      </View>
    </View>
  )
}

export const CardNextStep: React.FC = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "Primary">>()

  const STEPS: Step[] = [
    {
      title: LL.CardNextStepScreen.steps.one.title(),
      description: LL.CardNextStepScreen.steps.one.description(),
    },
    {
      title: LL.CardNextStepScreen.steps.two.title(),
      description: LL.CardNextStepScreen.steps.two.description(),
    },
    {
      title: LL.CardNextStepScreen.steps.three.title(),
      description: LL.CardNextStepScreen.steps.three.description(),
    },
    {
      title: LL.CardNextStepScreen.steps.four.title(),
      description: LL.CardNextStepScreen.steps.four.description(),
    },
  ]

  const handleWebview = () => {
    const sumsubUrl = ""
    navigation.navigate("webView", {
      url: sumsubUrl,
      initialTitle: LL.CardNextStepScreen.getStarted(),
    })
  }

  return (
    <Screen>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.topSpacer} />
        {STEPS.map((step, index) => (
          <StepItem
            key={`step-${index}`}
            step={step}
            isCurrentStep={index === 0}
            stepNumber={index + 1}
          />
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <GaloyPrimaryButton
          title={LL.CardNextStepScreen.getStarted()}
          onPress={handleWebview}
        />
      </View>
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => {
  const circleSize = circleDiameterThatContainsSquare(22)

  return {
    scrollContainer: {
      marginHorizontal: 40,
      marginBottom: 20,
    },
    topSpacer: {
      marginTop: 30,
    },
    stepContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 30,
      gap: 15,
    },
    stepNumberCircle: {
      borderRadius: circleSize,
      width: circleSize,
      height: circleSize,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.grey5,
      marginTop: 2,
    },
    stepNumberCircleActive: {
      backgroundColor: colors.primary,
    },
    stepNumberText: {
      color: colors._white,
    },
    stepNumberTextActive: {
      color: colors._black,
    },
    stepContent: {
      flex: 1,
      gap: 4,
    },
    stepTitle: {
      lineHeight: 20,
    },
    stepDescription: {
      lineHeight: 18,
      opacity: 0.7,
    },
    buttonContainer: {
      justifyContent: "flex-end",
      marginBottom: 14,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
  }
})
