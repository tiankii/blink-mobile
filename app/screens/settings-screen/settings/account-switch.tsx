// import { useLevel } from "@app/graphql/level-context"
// import { useI18nContext } from "@app/i18n/i18n-react"
// import { RootStackParamList } from "@app/navigation/stack-param-lists"
// import { useNavigation } from "@react-navigation/native"
// import { StackNavigationProp } from "@react-navigation/stack"
// import { SettingsRow } from "../row"

// import { useTheme, ListItem } from "@rneui/themed"
// import { usePersistentStateContext } from "@app/store/persistent-state"
// import { useUsernameLazyQuery } from "@app/graphql/generated"
// import { useEffect, useRef, useState } from "react"
// import KeyStoreWrapper from "../../../utils/storage/secureStorage"

// type ProfileProps = {
//   username: string
//   token: string
//   selected?: boolean
// }

// const Profile: React.FC<ProfileProps> = ({ username, token, selected }) => {
//   const styles = useStyles()
//   const { LL } = useI18nContext()
//   const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
//   const { persistentState, updateState } = usePersistentStateContext()
//   const client = useApolloClient()
//   const [userLogoutMutation] = useUserLogoutMutation({
//     fetchPolicy: "no-cache",
//   })
//   const oldToken = persistentState.galoyAuthToken

//   const logout = useCallback(async (): Promise<void> => {
//     try {
//       const deviceToken = await messaging().getToken()
//       logLogout()
//       await Promise.race([
//         userLogoutMutation({ variables: { input: { deviceToken } } }),
//         // Create a promise that rejects after 2 seconds
//         // this is handy for the case where the server is down, or in dev mode
//         new Promise((_, reject) => {
//           setTimeout(() => {
//             reject(new Error("Logout mutation timeout"))
//           }, 2000)
//         }),
//       ])
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         crashlytics().recordError(err)
//         console.debug({ err }, `error logout`)
//       }
//     }
//   }, [userLogoutMutation])

//   const handleLogout = async () => {
//     await KeyStoreWrapper.updateAllTokens(token)
//     updateState((state) => {
//       if (state) {
//         return {
//           ...state,
//         }
//       }
//       return state
//     })
//     await logout()
//   }

//   const handleProfileSwitch = () => {
//     updateState((state) => {
//       if (state) {
//         return {
//           ...state,
//           galoyAuthToken: token,
//         }
//       }
//       return state
//     })
//     client.clearStore() // clear cache to load fresh data using new token
//   }

//   return (
//     <TouchableOpacity onPress={handleProfileSwitch}>
//       <View style={styles.profile}>
//         <View style={styles.iconContainer}>
//           {selected && (
//             <GaloyIcon name="check-circle" size={30} style={styles.checkIcon} />
//           )}
//         </View>
//         <Text>{username}</Text>
//         {!selected && (
//           <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//             <Text style={styles.logoutButtonText}>{LL.ProfileScreen.logout()}</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//       <View style={styles.divider}></View>
//     </TouchableOpacity>
//   )
// }

// export const AccountSwitchSetting: React.FC = () => {
//   const { currentLevel: level } = useLevel()
//   const { LL } = useI18nContext()
//   //   const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>()

//   const { persistentState } = usePersistentStateContext()

//   const { galoyAuthToken: curToken } = persistentState

//   const [profiles, setProfiles] = useState<ProfileProps[]>([])
//   const [fetchUsername, { error, refetch }] = useUsernameLazyQuery({
//     fetchPolicy: "no-cache",
//   })
//   const [loading, setLoading] = useState<boolean>(true)

//   useEffect(() => {
//     const fetchUsernames = async () => {
//       setLoading(true)
//       // Avoid duplicate account data
//       setProfiles([])
//       const profiles: ProfileProps[] = []
//       const allTokens = await KeyStoreWrapper.getAllTokens()
//       let counter = 1
//       for (const token of allTokens) {
//         try {
//           const { data } = await fetchUsername({
//             context: {
//               headers: {
//                 authorization: `Bearer ${token}`,
//               },
//             },
//           })
//           if (data && data.me) {
//             profiles.push({
//               username: data.me.username ? data.me.username : `Account ${counter++}`,
//               token,
//               selected: token === curToken,
//             })
//           }
//         } catch (err) {
//           console.error(`Failed to fetch username for token ${token}`, err)
//         }
//       }
//       setProfiles(profiles)
//       setLoading(false)
//     }
//     fetchUsernames()
//   }, [fetchUsername, curToken])

//   return (
//     <ListItem.Accordion
//     content={
//       <ListItem.Content>
//         <ListItem.Title>Top Users</ListItem.Title>
//         <ListItem.Subtitle>Tap to expand</ListItem.Subtitle>
//       </ListItem.Content>
//     }
//     isExpanded={true}
//     onPress={() => {}}
//   >
//     <SettingsRow
//       title={LL.AccountScreen.switch()}
//       subtitle={""}
//       leftIcon="people"
//       action={() => {
//         // navigate("accountScreen")
//         console.log("click here")
//       }}
//     >
//       <>
//         {profiles.map((profile, index) => {
//           return <Profile key={index} {...profile} />
//         })}
//       </>
//     </SettingsRow>
//   )
// }
