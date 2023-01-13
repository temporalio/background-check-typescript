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
  let ssnSearchId: string | undefined = undefined
  let creditSearchId: string | undefined = undefined
  let socialSearchId: string | undefined = undefined

  const approvalRequestId = await requestApproval({ customerId, userId })
  try {
    await getApprovalStatus({ approvalRequestId, targetStatus: 'complete' })

    await Promise.all([
      async () => (ssnSearchId = await performSearch({ type: 'ssn', customerId, userId })),
      async () => (creditSearchId = await performSearch({ type: 'credit', customerId, userId })),
      async () => (socialSearchId = await performSearch({ type: 'social', customerId, userId })),
    ])
  } catch (err) {
    console.log((err as Error).message)
  }

  await sendReport({ customerId, userId, approvalRequestId, ssnSearchId, creditSearchId, socialSearchId })
}

async function performSearch(info: SearchInfo) {
  await startSearch(info)
  const searchId = await getSearchResult({ ...info, targetStatus: 'complete' })
  return searchId
}
