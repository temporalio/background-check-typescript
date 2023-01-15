import { proxyActivities } from '@temporalio/workflow'
import type { createActivities } from './activities'
import { SearchInfo } from './types'

const { requestApproval, getApprovalStatus, startSearch, getSearchResult, sendReport } = proxyActivities<
  ReturnType<typeof createActivities>
>({
  startToCloseTimeout: '1s',
})

interface BackgroundCheckInput {
  customerId: string
  userId: string
}

export async function backgroundCheck({ customerId, userId }: BackgroundCheckInput): Promise<void> {
  await requestApproval({ customerId, userId })
  const approvalId = await getApprovalStatus({ customerId, userId, targetStatus: 'complete' })

  const [ssnSearchId, creditSearchId, socialSearchId] = await Promise.all(
    ['ssn', 'credit', 'social'].map((type) => performSearch({ type, customerId, userId }))
  )

  await sendReport({ customerId, userId, approvalId, ssnSearchId, creditSearchId, socialSearchId })
}

async function performSearch(info: SearchInfo) {
  await startSearch(info)
  const searchId = await getSearchResult({ ...info, targetStatus: 'complete' })
  return searchId
}
