import React, { useState } from "react"
import { ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useApolloClient } from "@apollo/client"
import { StackNavigationProp } from "@react-navigation/stack"
import { ListItem, Avatar, Overlay, Text, makeStyles } from "@rneui/themed"

import { GaloyIcon } from "@app/components/atomic/galoy-icon/galoy-icon"
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button/galoy-icon-button"
import { useI18nContext } from "@app/i18n/i18n-react"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import useLogout from "@app/hooks/use-logout"

export const Profile: React.FC<ProfileProps> = ({
  identifier,
  token,
  selected,
  avatarurl,
}) => {
  const styles = useStyles()
  const { LL } = useI18nContext()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [switchLoading, setSwitchLoading] = useState(false)
  const { updateState } = usePersistentStateContext()
  const client = useApolloClient()
  const { logout } = useLogout()

  const handleLogout = async () => {
    setLogoutLoading(true)
    await logout(false, token)
    navigation.navigate("Primary")
    setLogoutLoading(false)
  }

  const handleProfileSwitch = () => {
    setSwitchLoading(true)
    updateState((state) => (state ? { ...state, galoyAuthToken: token } : state))
    client.clearStore()
    setSwitchLoading(false)
  }

  return (
    <>
      <ListItem
        bottomDivider
        onPress={handleProfileSwitch}
        containerStyle={styles.listItem}
        style={selected && styles.listItemSelected}
      >
        {avatarurl ? (
          <Avatar rounded source={{ uri: avatarurl }} size={44} />
        ) : (
          <GaloyIcon name="user" size={30} backgroundColor={styles.iconColor.color} />
        )}
        <ListItem.Content>
          <ListItem.Title>{identifier}</ListItem.Title>
        </ListItem.Content>

        {selected === false &&
          (logoutLoading ? (
            <ActivityIndicator size="large" color={styles.loadingIconColor.color} />
          ) : (
            <GaloyIconButton
              name="close"
              size="medium"
              onPress={handleLogout}
              backgroundColor={styles.iconColor.color}
            />
          ))}
      </ListItem>

      <Overlay isVisible={switchLoading} overlayStyle={styles.overlayStyle}>
        <ActivityIndicator size={50} color={styles.loadingIconColor.color} />
        <Text>{LL.AccountScreen.pleaseWait()}</Text>
      </Overlay>
    </>
  )
}

export const useStyles = makeStyles(({ colors }) => ({
  listItem: {
    backgroundColor: colors.grey4,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey3,
  },
  listItemSelected: {
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
  },
  iconColor: {
    color: colors.grey5,
  },
  loadingIconColor: {
    color: colors.primary,
  },
  overlayStyle: {
    backgroundColor: "transparent",
    shadowColor: "transparent",
  },
}))
