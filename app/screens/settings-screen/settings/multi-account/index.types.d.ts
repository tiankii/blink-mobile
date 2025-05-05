type ProfileProps = {
  userId?: string | null
  identifier: string
  token: string
  selected?: boolean
  avatarUrl?: string
}

type FetchProfilesParams = {
  currentToken: string
  fetchUsername: LazyQueryExecFunction<GetUsernamesQuery, Record<string, never>>
  LL: TranslationFunctions
}
