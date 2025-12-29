import * as React from "react"
import { makeStyles, useTheme, Text } from "@rn-vui/themed"
import { Screen } from "../../components/screen"
import { View, ScrollView, Switch } from "react-native"

const LimitCard: React.FC<{ dailyLimit: number; monthlyLimit: number }> = ({
  dailyLimit,
  monthlyLimit,
}) => {
  const styles = useStyles()

  return (
    <View style={styles.limitCard}>
      <Text style={styles.limitCardTitle} type="p2">
        Current limits
      </Text>
      <View style={styles.limitCardContent}>
        <View style={styles.limitItem}>
          <Text style={styles.limitAmount} type="h2">
            ${dailyLimit.toLocaleString()}
          </Text>
          <Text style={styles.limitLabel} type="p3">
            Daily spending
          </Text>
        </View>
        <View style={styles.limitItem}>
          <Text style={styles.limitAmount} type="h2">
            ${monthlyLimit.toLocaleString()}
          </Text>
          <Text style={styles.limitLabel} type="p3">
            Monthly spending
          </Text>
        </View>
      </View>
    </View>
  )
}

const LimitSection: React.FC<{
  title: string
  amount: number
  description: string
}> = ({ title, amount, description }) => {
  const styles = useStyles()

  return (
    <View style={styles.limitSection}>
      <Text style={styles.sectionLabel} type="p3">
        {title}
      </Text>
      <View style={styles.amountContainer}>
        <Text type="p1">${amount.toLocaleString()}</Text>
      </View>
      <Text style={styles.descriptionText} type="p4">
        {description}
      </Text>
    </View>
  )
}

const TransactionToggle: React.FC<{
  title: string
  description: string
  value: boolean
  onValueChange: (value: boolean) => void
}> = ({ title, description, value, onValueChange }) => {
  const styles = useStyles()

  return (
    <View style={styles.toggleContent}>
      <View style={styles.toggleTextContainer}>
        <Text style={styles.toggleTitle} type="p3">
          {title}
        </Text>
        <Text style={styles.toggleDescription} type="p3">
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#3a3a3a", true: "#ffa500" }}
        thumbColor="#ffffff"
      />
    </View>
  )
}

export const CardLimitsScreen: React.FC = () => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  const [onlinePurchases, setOnlinePurchases] = React.useState(true)
  const [atmWithdrawals, setAtmWithdrawals] = React.useState(true)
  const [contactlessPayments, setContactlessPayments] = React.useState(true)

  return (
    <Screen>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LimitCard dailyLimit={1000} monthlyLimit={5000} />

        <Text style={styles.sectionHeader} type="p2">
          Spending limits
        </Text>

        <LimitSection
          title="Daily spending"
          amount={1000}
          description="Maximum amount you can spend per day"
        />

        <LimitSection
          title="Monthly spending limits"
          amount={5000}
          description="Maximum amount you can spend per month"
        />

        <Text style={styles.sectionHeader} type="p2">
          ATM withdrawal limits
        </Text>

        <LimitSection
          title="Daily ATM limits"
          amount={500}
          description="Maximum ATM withdrawal per day"
        />

        <LimitSection
          title="Monthly ATM limit"
          amount={2000}
          description="Maximum ATM withdrawal per month"
        />

        <Text style={styles.sectionHeader} type="p3">
          Transaction types
        </Text>

        <View style={styles.toggleContainer}>
          <TransactionToggle
            title="Online purchases"
            description="Allow online and e-commerce transactions"
            value={onlinePurchases}
            onValueChange={setOnlinePurchases}
          />
          <View style={styles.divider} />
          <TransactionToggle
            title="Online purchases"
            description="Allow online and e-commerce transactions"
            value={onlinePurchases}
            onValueChange={setOnlinePurchases}
          />
          <View style={styles.divider} />
          <TransactionToggle
            title="ATM withdrawals"
            description="Allow cash withdrawals from ATMs"
            value={atmWithdrawals}
            onValueChange={setAtmWithdrawals}
          />
          <View style={styles.divider} />
          <TransactionToggle
            title="Contactless payments"
            description="Allow tap-to-pay transactions"
            value={contactlessPayments}
            onValueChange={setContactlessPayments}
          />
        </View>
      </ScrollView>
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  scrollView: {
    flex: 1,
    marginHorizontal: 20,
  },
  limitCard: {
    marginBottom: 15,
  },
  limitCardTitle: {
    marginBottom: 10,
  },
  limitCardContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.grey5,
    borderRadius: 8,
    padding: 20,
  },
  limitItem: {
    alignItems: "center",
  },
  limitAmount: {
    marginBottom: 4,
  },
  limitLabel: {
    color: colors.grey3,
  },
  sectionHeader: {
    marginBottom: 16,
    marginTop: 8,
  },
  limitSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  amountContainer: {
    backgroundColor: colors.grey5,
    borderRadius: 8,
    padding: 16,
    marginBottom: 6,
  },

  descriptionText: {
    color: colors.grey3,
  },
  toggleContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleContainer: {
    backgroundColor: colors.grey5,
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    marginBottom: 4,
  },
  toggleDescription: {
    color: colors.grey3,
  },
  divider: {
    height: 1,
    backgroundColor: colors.grey4,
  },
}))
