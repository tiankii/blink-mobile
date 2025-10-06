import * as React from "react"
import { makeStyles, Text } from "@rn-vui/themed"
import { Screen } from "../../components/screen"
import { ScrollView, View } from "react-native"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

export const CardThankYou: React.FC = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const WELCOME_CONTENT = {
    greeting: LL.CardThankYouScreen.welcomeMessage.greeting(),
    paragraphs: [
      LL.CardThankYouScreen.welcomeMessage.paragraphs.body1(),
      LL.CardThankYouScreen.welcomeMessage.paragraphs.body2(),
      LL.CardThankYouScreen.welcomeMessage.paragraphs.body3(),
      LL.CardThankYouScreen.welcomeMessage.paragraphs.body4(),
      LL.CardThankYouScreen.welcomeMessage.paragraphs.body5(),
    ],
    closing: LL.CardThankYouScreen.welcomeMessage.closing(),
    signature: LL.CardThankYouScreen.welcomeMessage.signature(),
  }

  const handleNext = () => {
    navigation.navigate("CardNextStep")
  }

  return (
    <Screen>
      <ScrollView style={styles.contentContainer}>
        <Text type="h2" style={styles.greeting}>
          {WELCOME_CONTENT.greeting}
        </Text>

        {WELCOME_CONTENT.paragraphs.map((paragraph, index) => (
          <Text key={`paragraph-${index}`} type="p2" style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}

        <Text type="p2" style={styles.closing}>
          {WELCOME_CONTENT.closing}
        </Text>
        <Text type="p2" bold style={styles.signature}>
          {WELCOME_CONTENT.signature}
        </Text>
      </ScrollView>

      <View style={styles.buttonsContainer}>
        <GaloyPrimaryButton title={LL.common.next()} onPress={handleNext} />
      </View>
    </Screen>
  )
}

const useStyles = makeStyles(() => ({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  greeting: {
    marginBottom: 24,
    paddingTop: 30,
  },
  paragraph: {
    marginBottom: 20,
    lineHeight: 24,
  },
  closing: {
    marginTop: 12,
    marginBottom: 4,
  },
  signature: {
    marginBottom: 32,
  },
  buttonsContainer: {
    justifyContent: "flex-end",
    marginBottom: 14,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
}))
