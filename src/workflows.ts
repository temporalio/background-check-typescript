import { requestApproval, getApprovalStatus, startSearch, getSearchResult, sendReport } from './activities'
import { AuthHeader, SearchInfo } from './types'

interface BackgroundCheckInput {
  customerId: string
  userId: string
  authHeader: AuthHeader
}

export async function backgroundCheck({ customerId, userId, authHeader }: BackgroundCheckInput): Promise<void> {
  const approvalRequestId = await requestApproval({ customerId, userId, authHeader })
  await poll(() => getApprovalStatus({ approvalRequestId, targetStatus: 'complete', authHeader }))

  const [ssnSearchId, creditSearchId, socialSearchId] = await Promise.all(
    ['ssn', 'credit', 'social'].map((type) => performSearch({ type, customerId, userId, authHeader }))
  )

  await sendReport({ customerId, userId, approvalRequestId, ssnSearchId, creditSearchId, socialSearchId, authHeader })
}

async function performSearch(info: SearchInfo) {
  await startSearch(info)
  const searchResult = await poll(() => getSearchResult({ ...info, targetStatus: 'complete' }))
  return searchResult
}

async function poll<T>(fn: () => Promise<T>): Promise<T> {
  while (true) {
    try {
      return await fn()
    } catch (err) {
      console.error('Retrying:', (err as Error).message)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
}
