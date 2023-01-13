import { CancellationScope, isCancellation, proxyActivities } from '@temporalio/workflow'
import type { createActivities } from './activities'
import { SearchInfo } from './types'

const { requestApproval, cancelApproval, getApprovalStatus, startSearch, cancelSearch, getSearchResult, sendReport } =
  proxyActivities<ReturnType<typeof createActivities>>({
    startToCloseTimeout: '1s',
  })

interface BackgroundCheckInput {
  customerId: string
  userId: string
}

export async function backgroundCheck({ customerId, userId }: BackgroundCheckInput): Promise<void> {
  let approvalRequestId: string | undefined = undefined
  let ssnSearchId: string | undefined = undefined
  let creditSearchId: string | undefined = undefined
  let socialSearchId: string | undefined = undefined

  try {
    approvalRequestId = await requestApproval({ customerId, userId })

    try {
      try {
        await getApprovalStatus({ approvalRequestId, targetStatus: 'complete' })
      } catch (err) {
        if (isCancellation(err)) {
          await CancellationScope.nonCancellable(async () => {
            await cancelApproval({ approvalRequestId: approvalRequestId! })

            // wait for cancellation to complete
            await getApprovalStatus({ approvalRequestId: approvalRequestId!, targetStatus: 'cancelled' })
          })
        }
        throw err
      }

      await Promise.all([
        async () => (ssnSearchId = await performSearch({ type: 'ssn', customerId, userId })),
        async () => (creditSearchId = await performSearch({ type: 'credit', customerId, userId })),
        async () => (socialSearchId = await performSearch({ type: 'social', customerId, userId })),
      ])
    } catch (err) {
      console.log((err as Error).message)
      if (isCancellation(err)) {
        throw err
      }
    }
  } finally {
    await CancellationScope.nonCancellable(async () =>
      sendReport({ customerId, userId, approvalRequestId, ssnSearchId, creditSearchId, socialSearchId })
    )
  }
}

async function performSearch(info: SearchInfo) {
  let searchId: string | undefined = undefined
  await startSearch(info)

  try {
    searchId = await getSearchResult({ ...info, targetStatus: 'complete' })
  } catch (err) {
    await CancellationScope.nonCancellable(async () => {
      await cancelSearch(info)

      // wait for cancellation to complete
      searchId = await getSearchResult({ ...info, targetStatus: 'cancelled' })
    })
    throw err
  }

  return searchId
}
