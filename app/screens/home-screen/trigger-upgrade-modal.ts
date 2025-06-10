import { AccountLevel } from "@app/graphql/generated"

const BALANCE_LIMIT_TO_SHOW_TRIAL_MODAL = 2100 // SATs

export const triggerUpgradeModal = ({
  accountId,
  satsBalance,
  levelAccount,
  openUpgradeModal,
}: {
  accountId?: string
  satsBalance: number
  levelAccount?: AccountLevel
  openUpgradeModal: () => void
}) => {
  if (!accountId || levelAccount !== AccountLevel.Zero) return
  if (satsBalance > BALANCE_LIMIT_TO_SHOW_TRIAL_MODAL) {
    openUpgradeModal()
  }
}
