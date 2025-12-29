import * as React from "react"
import { makeStyles, useTheme } from "@rn-vui/themed"
import { Screen } from "../../components/screen"
import { View, Text, ScrollView, Switch } from "react-native"

const LimitCard: React.FC<{ dailyLimit: number; monthlyLimit: number }> = ({ 
  dailyLimit, 
  monthlyLimit 
}) => {
  const styles = useStyles()
  
  return (
    <View style={styles.limitCard}>
      <Text style={styles.limitCardTitle}>Current limits</Text>
      <View style={styles.limitCardContent}>
        <View style={styles.limitItem}>
          <Text style={styles.limitAmount}>${dailyLimit.toLocaleString()}</Text>
          <Text style={styles.limitLabel}>Daily spending</Text>
        </View>
        <View style={styles.limitItem}>
          <Text style={styles.limitAmount}>${monthlyLimit.toLocaleString()}</Text>
          <Text style={styles.limitLabel}>Monthly spending</Text>
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
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.amountContainer}>
        <Text style={styles.amountText}>${amount.toLocaleString()}</Text>
      </View>
      <Text style={styles.descriptionText}>{description}</Text>
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
    <View style={styles.toggleContainer}>
      <View style={styles.toggleTextContainer}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#3a3a3a', true: '#ffa500' }}
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

        <Text style={styles.sectionHeader}>Spending limits</Text>
        
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

        <Text style={styles.sectionHeader}>ATM withdrawal limits</Text>

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

        <Text style={styles.sectionHeader}>Transaction types</Text>

        <TransactionToggle
          title="Online purchases"
          description="Allow online and e-commerce transactions"
          value={onlinePurchases}
          onValueChange={setOnlinePurchases}
        />

        <TransactionToggle
          title="ATM withdrawals"
          description="Allow cash withdrawals from ATMs"
          value={atmWithdrawals}
          onValueChange={setAtmWithdrawals}
        />

        <TransactionToggle
          title="Contactless payments"
          description="Allow tap-to-pay transactions"
          value={contactlessPayments}
          onValueChange={setContactlessPayments}
        />
      </ScrollView>
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  scrollView: {
    flex: 1,
    padding: 16,
  },
  limitCard: {
    marginBottom: 15,
  },
  limitCardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  limitCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 20,
  },
  limitItem: {
    alignItems: 'center',
  },
  limitAmount: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  limitLabel: {
    color: '#999999',
    fontSize: 14,
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
  },
  limitSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 8,
  },
  amountContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 6,
  },
  amountText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  descriptionText: {
    color: '#666666',
    fontSize: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  toggleDescription: {
    color: '#666666',
    fontSize: 13,
  },
}))