type ProfileProps = {
  userid?: string | null
  identifier: string
  token: string
  selected?: boolean
  avatarurl?: string
}

type FetchProfilesParams = {
  currentToken: string
  fetchUsername: LazyQueryExecFunction<GetUsernamesQuery, Record<string, never>>
  LL: TranslationFunctions
}
