import crashlytics from "@react-native-firebase/crashlytics"

import { GetUsernamesQuery } from "@app/graphql/generated"
import KeyStoreWrapper from "@app/utils/storage/secureStorage"

export const fetchProfiles = async ({
  currentToken,
  fetchUsername,
  LL,
}: FetchProfilesParams): Promise<ProfileProps[]> => {
  const profiles: ProfileProps[] = []
  let sessionTokens = (await KeyStoreWrapper.getSessionTokens()).reverse()
  let counter = 1

  if (sessionTokens.length <= 0 && currentToken) {
    await KeyStoreWrapper.saveSessionToken(currentToken)
    sessionTokens = [currentToken]
  }

  for (const token of sessionTokens) {
    try {
      const { data } = await fetchUsername({
        context: { headers: { authorization: `Bearer ${token}` } },
      })

      const existingProfileIndex = findExistingProfileIndex(profiles, data)
      if (data?.me && existingProfileIndex === -1) {
        profiles.push({
          userId: data.me.id,
          identifier:
            data.me.username || data.me.phone || `${LL.common.blinkUser()} #${counter}`,
          token,
          selected: currentToken === token,
        })
        counter += 1
      }

      if (existingProfileIndex !== -1 || !data?.me) {
        await KeyStoreWrapper.removeTokenFromSession(token)
      }
    } catch (err) {
      if (err instanceof Error) crashlytics().recordError(err)
    }
  }

  return profiles
}

const findExistingProfileIndex = (
  profiles: ProfileProps[],
  userData?: GetUsernamesQuery,
) => {
  return profiles.findIndex(
    (profile) =>
      profile.identifier === userData?.me?.username ||
      profile.identifier === userData?.me?.phone,
  )
}
