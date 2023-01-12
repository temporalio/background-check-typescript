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

  const ssnSearchId = await performSearch({ type: 'ssn', customerId, userId, authHeader })
  const creditSearchId = await performSearch({ type: 'credit', customerId, userId, authHeader })
  const socialSearchId = await performSearch({ type: 'social', customerId, userId, authHeader })

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
