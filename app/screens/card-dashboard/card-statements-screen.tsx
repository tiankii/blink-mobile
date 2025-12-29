import * as React from "react"
import { Icon, makeStyles, useTheme, Text } from "@rn-vui/themed"
import { Screen } from "../../components/screen"
import { View, ScrollView, Switch, TouchableOpacity } from "react-native"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"

const YearSelector: React.FC<{
  selectedYear: number
  onPress: () => void
}> = ({ selectedYear, onPress }) => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  return (
    <View style={styles.yearSelectorContainer}>
      <Text style={styles.sectionTitle} type="p3">
        Select year
      </Text>
      <TouchableOpacity style={styles.yearSelector} onPress={onPress}>
        <Text style={styles.calendarIcon}>
          <Icon name="calendar-number-outline" size={20} type="ionicon" />
        </Text>
        <Text style={styles.yearText}>{selectedYear}</Text>
        <Text>
          <Icon
            name="chevron-down-outline"
            size={20}
            type="ionicon"
            color={colors.primary}
          />
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const CurrentStatement: React.FC<{
  period: string
  totalSpent: string
}> = ({ period, totalSpent }) => {
  const styles = useStyles()

  return (
    <View style={styles.currentStatementContainer}>
      <Text style={styles.sectionTitle} type="p3">
        Current statement
      </Text>
      <View style={styles.currentStatementCard}>
        <View style={styles.statementInfo}>
          <Text style={styles.statementLabel} type="p4">
            Statement period
          </Text>
          <Text style={styles.statementValue}>{period}</Text>
        </View>
        <View style={styles.statementInfo}>
          <Text style={styles.statementLabel} type="p4">
            Total spent
          </Text>
          <Text style={styles.statementValue}>{totalSpent}</Text>
        </View>
      </View>
    </View>
  )
}

const DownloadAllButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const styles = useStyles()

  return (
    <TouchableOpacity style={styles.downloadAllButton} onPress={onPress}>
      <Text style={styles.downloadIcon}>
        <GaloyIcon name="download-simple" size={20} />
      </Text>
      <Text style={styles.downloadAllText}>Download all</Text>
    </TouchableOpacity>
  )
}

const StatementItem: React.FC<{
  month: string
  dateRange?: string
  amountSpent: string
  transactions?: string
  onDownload: () => void
}> = ({ month, dateRange, amountSpent, transactions, onDownload }) => {
  const styles = useStyles()

  return (
    <View style={styles.statementItem}>
      <View style={styles.statementItemLeft}>
        <Text style={styles.documentIcon}>
          <Icon name="document-text-outline" size={20} type="ionicon" />
        </Text>
        <View style={styles.statementItemInfo}>
          <Text style={styles.statementMonth}>{month}</Text>
          {dateRange && <Text style={styles.statementDateRange}>{dateRange}</Text>}
          {transactions && (
            <Text style={styles.statementTransactions}>{transactions}</Text>
          )}
          <Text style={styles.statementAmount}>{amountSpent} spent</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onDownload}>
        <Text style={styles.downloadIconButton}>
          <GaloyIcon name="download-simple" size={20} />
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const AboutStatements: React.FC = () => {
  const styles = useStyles()

  return (
    <View style={styles.aboutContainer}>
      <View style={styles.aboutContent}>
        <Text style={styles.aboutTitle}>About statements</Text>
        <Text style={styles.bulletPoint}>
          • Monthly statements are generated on the last day of each month
        </Text>
        <Text style={styles.bulletPoint}>
          • Statements include all transactions and fees for the period
        </Text>
        <Text style={styles.bulletPoint}>• Download statements as PDF</Text>
      </View>
    </View>
  )
}

const NotificationToggle: React.FC<{
  value: boolean
  onValueChange: (value: boolean) => void
}> = ({ value, onValueChange }) => {
  const styles = useStyles()

  return (
    <View style={styles.notificationContainer}>
      <Text style={styles.sectionTitle} type="p3">
        Notifications
      </Text>
      <View style={styles.notificationToggle}>
        <Text style={styles.notificationText}>
          Notify me when new statements are made available
        </Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#3a3a3a", true: "#ffa500" }}
          thumbColor="#ffffff"
        />
      </View>
    </View>
  )
}

const SupportButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  return (
    <View style={styles.supportContainer}>
      <Text style={styles.sectionTitle} type="p3">
        Support
      </Text>
      <TouchableOpacity style={styles.supportButton} onPress={onPress}>
        <Text style={styles.supportIcon}>
          <GaloyIcon name="support" size={20} />
        </Text>
        <View style={styles.supportInfo}>
          <Text style={styles.supportTitle}>Contact support</Text>
          <Text style={styles.supportEmail}>support@blinkbtc.com</Text>
        </View>
        <Text style={styles.chevronRight}>
          <Icon
            name="chevron-forward-outline"
            size={20}
            type="ionicon"
            color={colors.primary}
          />
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export const CardStatementsScreen: React.FC = () => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  const [selectedYear, setSelectedYear] = React.useState(2025)
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)

  const handleYearPress = () => {
    console.log("Open year picker")
  }

  const handleDownloadAll = () => {
    console.log("Download all statements")
  }

  const handleDownloadStatement = (month: string) => {
    console.log(`Download ${month} statement`)
  }

  const handleSupportPress = () => {
    console.log("Contact support")
  }

  return (
    <Screen>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <YearSelector selectedYear={selectedYear} onPress={handleYearPress} />

        <CurrentStatement period="Aug 1 - Aug 30" totalSpent="$1,021.00" />

        <View style={styles.monthlyStatementsContainer}>
          <Text style={styles.sectionTitle} type="p3">
            Monthly statements
          </Text>

          <DownloadAllButton onPress={handleDownloadAll} />

          <StatementItem
            month="August 2025"
            amountSpent="$1,021.00"
            onDownload={() => handleDownloadStatement("August 2025")}
          />

          <StatementItem
            month="July 2025"
            dateRange="Jul 1 - Jul 30, 2025"
            transactions="5 transactions, $121.00 spent"
            amountSpent="$121.00"
            onDownload={() => handleDownloadStatement("July 2025")}
          />

          <StatementItem
            month="June 2025"
            dateRange="Jul 1 - Jul 30, 2025"
            transactions="5 transactions, $121.00 spent"
            amountSpent="$121.00"
            onDownload={() => handleDownloadStatement("June 2025")}
          />
        </View>

        <AboutStatements />

        <NotificationToggle
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />

        <SupportButton onPress={handleSupportPress} />
      </ScrollView>
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  yearSelectorContainer: {
    marginBottom: 24,
  },
  yearSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 16,
  },
  calendarIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  yearText: {
    flex: 1,
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  currentStatementContainer: {
    marginBottom: 24,
  },
  currentStatementCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 20,
  },
  statementInfo: {
    flex: 1,
  },
  statementLabel: {
    color: colors.grey3,
    marginBottom: 4,
  },
  statementValue: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  monthlyStatementsContainer: {
    marginBottom: 24,
  },
  downloadAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  downloadIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  downloadAllText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  statementItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  statementItemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  documentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statementItemInfo: {
    flex: 1,
  },
  statementMonth: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  statementDateRange: {
    color: "#999999",
    fontSize: 12,
    marginBottom: 2,
  },
  statementTransactions: {
    color: "#999999",
    fontSize: 12,
    marginBottom: 2,
  },
  statementAmount: {
    color: "#999999",
    fontSize: 12,
  },
  downloadIconButton: {
    color: "#ffa500",
    fontSize: 20,
  },
  aboutContainer: {
    marginBottom: 24,
  },
  aboutTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  aboutContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 16,
  },
  bulletPoint: {
    color: "#999999",
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationContainer: {
    marginBottom: 24,
  },
  notificationToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 16,
  },
  notificationText: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
    marginRight: 12,
  },
  supportContainer: {
    marginBottom: 24,
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 16,
  },
  supportIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  supportInfo: {
    flex: 1,
  },
  supportTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  supportEmail: {
    color: "#999999",
    fontSize: 13,
  },
  chevronRight: {
    color: "#999999",
    fontSize: 24,
  },
}))
