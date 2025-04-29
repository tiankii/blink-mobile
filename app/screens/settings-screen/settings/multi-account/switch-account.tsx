import React, { useState, useEffect, useRef } from "react"
import { Button, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { ListItem, Icon, Text, useTheme, makeStyles } from "@rneui/themed"
import { gql } from "@apollo/client"

import { usePersistentStateContext } from "@app/store/persistent-state"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { SettingsRow } from "@app/screens/settings-screen/row"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useGetUsernamesLazyQuery } from "@app/graphql/generated"

import { Profile } from "./profile"
import { fetchProfiles } from "./utils"

gql`
  query getUsernames {
    me {
      id
      phone
      username
    }
  }
`
export const SwitchAccount: React.FC = () => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()
  const { LL } = useI18nContext()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { persistentState } = usePersistentStateContext()
  const { galoyAuthToken: currentToken } = persistentState

  const [fetchUsername, { error, refetch }] = useGetUsernamesLazyQuery({
    fetchPolicy: "no-cache",
  })
  const [profiles, setProfiles] = useState<ProfileProps[]>([])
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState<boolean>(true)

  const prevTokenRef = useRef<string>(currentToken)

  useEffect(() => {
    if (!expanded) return

    const loadProfiles = async () => {
      setLoading(true)
      const profilesList = await fetchProfiles({ currentToken, fetchUsername, LL })
      setProfiles(profilesList)
      setLoading(false)
    }

    loadProfiles()
  }, [expanded, currentToken, fetchUsername, LL])

  useEffect(() => {
    if (prevTokenRef.current !== currentToken) {
      navigation.navigate("Primary")
    }
    prevTokenRef.current = currentToken
  }, [currentToken, navigation])

  const handleAddNew = () => {
    navigation.navigate("getStarted")
  }

  return (
    <>
      <SettingsRow
        title={LL.AccountScreen.switchAccount()}
        leftIcon="people"
        action={() => setExpanded(!expanded)}
        expanded={expanded}
      />

      {expanded &&
        (loading ? (
          <ActivityIndicator
            testID="loading-indicator"
            size="large"
            style={styles.loadingIcon}
            color={styles.loadingIconColor.color}
          />
        ) : error ? (
          <>
            <Text adjustsFontSizeToFit style={styles.errorText}>
              {LL.ProfileScreen.error()}
            </Text>
            <Button
              title="reload"
              disabled={loading}
              color={colors.error}
              onPress={() => refetch()}
            />
          </>
        ) : (
          <>
            {profiles.map((profile, index) => (
              <Profile key={index} {...profile} />
            ))}
            <ListItem
              bottomDivider
              onPress={handleAddNew}
              containerStyle={styles.listItem}
            >
              <Icon name="add" size={25} type="ionicon" />
              <ListItem.Content>
                <ListItem.Title>{LL.ProfileScreen.addAccount()}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          </>
        ))}
    </>
  )
}

export const useStyles = makeStyles(({ colors }) => ({
  listItem: {
    backgroundColor: colors.grey4,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey3,
  },
  errorText: {
    color: colors.error,
    fontWeight: "bold",
    fontSize: 15,
    margin: 12,
    textAlign: "center",
  },
  loadingIcon: {
    margin: 15,
  },
  loadingIconColor: {
    color: colors.primary,
  },
}))
