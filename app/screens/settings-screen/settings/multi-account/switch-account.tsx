import React, { useState, useEffect, useRef } from "react"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { ListItem, Icon, makeStyles } from "@rneui/themed"

import { usePersistentStateContext } from "@app/store/persistent-state"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { SettingsRow } from "@app/screens/settings-screen/row"
import { useI18nContext } from "@app/i18n/i18n-react"

import { Profile } from "./profile"
import { fetchProfiles } from "./utils"

export const SwitchAccount: React.FC = () => {
  const styles = useStyles()
  const { LL } = useI18nContext()

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { persistentState } = usePersistentStateContext()
  const { galoyAuthToken: currentToken } = persistentState

  const [profiles, setProfiles] = useState<ProfileProps[]>([])
  const [expanded, setExpanded] = useState(false)

  const prevTokenRef = useRef<string>(currentToken)

  useEffect(() => {
    if (!expanded) return

    const loadProfiles = async () => {
      const profilesList = await fetchProfiles(currentToken)
      setProfiles(profilesList)
    }

    loadProfiles()
  }, [expanded, currentToken, LL])

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

      {expanded && (
        <>
          {profiles.map((profile, index) => (
            <Profile key={index} {...profile} />
          ))}
          <ListItem bottomDivider onPress={handleAddNew} containerStyle={styles.listItem}>
            <Icon name="add" size={25} type="ionicon" />
            <ListItem.Content>
              <ListItem.Title>{LL.ProfileScreen.addAccount()}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        </>
      )}
    </>
  )
}

export const useStyles = makeStyles(({ colors }) => ({
  listItem: {
    backgroundColor: colors.grey4,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey3,
  },
  loadingIcon: {
    margin: 15,
  },
  loadingIconColor: {
    color: colors.primary,
  },
}))
