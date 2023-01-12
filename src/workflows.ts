import { CancellationScope, proxyActivities } from '@temporalio/workflow'
import type * as activities from './activities'
import { SearchInfo } from './types'

const { requestApproval, pollForApproval, startSearch, pollForSearchResult, sendReport } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '1 minute',
})

interface BackgroundCheckInput {
  customerId: string
  userId: string
}

export async function backgroundCheck({ customerId, userId }: BackgroundCheckInput): Promise<void> {
  let approvalRequestId: string
  let ssnSearchId: string
  let creditSearchId: string
  let socialSearchId: string

  try {
    approvalRequestId = await requestApproval({ customerId, userId })
    await pollForApproval({ approvalRequestId, targetStatus: 'complete' })

    ssnSearchId = await performSearch({ type: 'ssn', customerId, userId })
    await Promise.all([
      async () => (creditSearchId = await performSearch({ type: 'credit', customerId, userId })),
      async () => (socialSearchId = await performSearch({ type: 'social', customerId, userId })),
    ])
  } finally {
    await CancellationScope.nonCancellable(() =>
      sendReport({ customerId, userId, approvalRequestId, ssnSearchId, creditSearchId, socialSearchId })
    )
  }
}

async function performSearch(info: SearchInfo) {
  await startSearch(info)
  const searchResult = await pollForSearchResult({ ...info, targetStatus: 'complete' })
  return searchResult
}
