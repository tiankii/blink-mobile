import * as React from "react"
import { Icon, makeStyles, useTheme, Text, Switch } from "@rn-vui/themed"
import { Screen } from "../../components/screen"
import { View, ScrollView, TouchableOpacity } from "react-native"
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
        <Text style={styles.yearText} type="p1">
          {selectedYear}
        </Text>
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
          <Text type="p1">{period}</Text>
        </View>
        <View style={styles.statementInfo}>
          <Text style={styles.statementLabel} type="p4">
            Total spent
          </Text>
          <Text type="p1">{totalSpent}</Text>
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
        <GaloyIcon name="download-simple" size={16} />
      </Text>
      <Text style={styles.downloadAllText} type="p3">
        Download all
      </Text>
    </TouchableOpacity>
  )
}

const StatementItem: React.FC<{
  month: string
  dateRange?: string
  transactions?: string
  onDownload: () => void
  disabled?: boolean
}> = ({ month, dateRange, transactions, onDownload, disabled }) => {
  const styles = useStyles()

  return (
    <View style={styles.statementItem}>
      <View style={styles.statementItemLeft}>
        <Text style={styles.documentIcon}>
          <Icon name="document-text-outline" size={20} type="ionicon" />
        </Text>
        <View style={styles.statementItemInfo}>
          <Text style={styles.statementMonth} type="p2">
            {month}
          </Text>
          {dateRange && (
            <Text style={styles.statementDateRange} type="p3">
              {dateRange}
            </Text>
          )}
          {transactions && (
            <Text style={styles.statementTransactions} type="p4">
              {transactions}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={onDownload}>
        <GaloyIcon name="download-simple" size={20} opacity={disabled ? 0.5 : 1} />
      </TouchableOpacity>
    </View>
  )
}

const AboutStatements: React.FC = () => {
  const styles = useStyles()

  return (
    <View style={styles.aboutContainer}>
      <View style={styles.aboutContent}>
        <Text style={styles.aboutTitle} type="p2">
          About statements
        </Text>
        <Text style={styles.bulletPoint} type="p2">
          • Monthly statements are generated on the last day of each month
        </Text>
        <Text style={styles.bulletPoint} type="p2">
          • Statements include all transactions and fees for the period
        </Text>
        <Text style={styles.bulletPoint} type="p2">
          • Download statements as PDF
        </Text>
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
        <Text style={styles.notificationText} type="p3">
          Notify me when new statements are made available
        </Text>
        <Switch value={value} onValueChange={onValueChange} />
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
          <Text style={styles.supportTitle} type="p3">
            Contact support
          </Text>
          <Text style={styles.supportEmail} type="p3">
            support@blinkbtc.com
          </Text>
        </View>
        <Icon
          name="chevron-forward-outline"
          size={20}
          type="ionicon"
          color={colors.primary}
        />
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

          <View style={{ display: "flex", flexDirection: "column" }}>
            <StatementItem
              month="August 2025"
              transactions="$1,021.00 spent"
              onDownload={() => handleDownloadStatement("August 2025")}
            />

            <StatementItem
              month="July 2025"
              dateRange="Jul 1 - Jul 30, 2025"
              transactions="5 transactions, $121.00 spent"
              onDownload={() => handleDownloadStatement("July 2025")}
              disabled
            />

            <StatementItem
              month="June 2025"
              dateRange="Jul 1 - Jul 30, 2025"
              transactions="5 transactions, $121.00 spent"
              onDownload={() => handleDownloadStatement("June 2025")}
              disabled
            />
          </View>
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
    marginHorizontal: 20,
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
    marginRight: 8,
  },
  downloadAllText: {
    color: colors.primary,
  },
  statementItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flex: 1,
  },
  statementItemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  documentIcon: {
    marginRight: 12,
  },
  statementItemInfo: {
    flex: 1,
  },
  statementMonth: {
    marginBottom: 2,
  },
  statementDateRange: {
    color: colors.grey3,
  },
  statementTransactions: {
    color: colors.grey3,
  },

  aboutContainer: {
    marginBottom: 24,
  },
  aboutTitle: {
    marginBottom: 12,
  },
  aboutContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 16,
  },
  bulletPoint: {
    color: colors.grey3,
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
    marginBottom: 2,
  },
  supportEmail: {
    color: colors.grey3,
  },
}))
