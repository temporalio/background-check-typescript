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
  let approvalId: string | undefined = undefined
  let ssnSearchId: string | undefined = undefined
  let creditSearchId: string | undefined = undefined
  let socialSearchId: string | undefined = undefined

  try {
    await requestApproval({ customerId, userId })

    try {
      try {
        approvalId = await getApprovalStatus({ customerId, userId, targetStatus: 'complete' })
      } catch (err) {
        if (isCancellation(err)) {
          await CancellationScope.nonCancellable(async () => {
            await cancelApproval({ approvalId: approvalId! })

            // wait for cancellation to complete
            approvalId = await getApprovalStatus({ customerId, userId, targetStatus: 'cancelled' })
          })
        }
        throw err
      }

      await Promise.all([
        (async () => (ssnSearchId = await performSearch({ type: 'ssn', customerId, userId })))(),
        (async () => (creditSearchId = await performSearch({ type: 'credit', customerId, userId })))(),
        (async () => (socialSearchId = await performSearch({ type: 'social', customerId, userId })))(),
      ])
    } catch (err) {
      console.log((err as Error).message)

      // If it's a CancelledFailure, rethrow it to "accept" cancellation
      // i.e. let the Workflow end with Cancelled status
      if (isCancellation(err)) {
        throw err
      }
      // Otherwise, it's a approval rejection. We don't throw, so that the
      // Workflow ends with Completed status instead of Failed status.
    }
  } finally {
    await CancellationScope.nonCancellable(async () =>
      sendReport({ customerId, userId, approvalId, ssnSearchId, creditSearchId, socialSearchId })
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
