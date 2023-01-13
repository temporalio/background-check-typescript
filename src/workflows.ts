import { requestApproval, getApprovalStatus, startSearch, getSearchResult, sendReport } from './activities'
import { AuthHeader, SearchInfo } from './types'

interface BackgroundCheckInput {
  customerId: string
  userId: string
  authHeader: AuthHeader
}

export async function backgroundCheck({ customerId, userId, authHeader }: BackgroundCheckInput): Promise<void> {
  const approvalRequestId = await retry(() => requestApproval({ customerId, userId, authHeader }))
  await retry(() => getApprovalStatus({ approvalRequestId, targetStatus: 'complete', authHeader }))

  const [ssnSearchId, creditSearchId, socialSearchId] = await Promise.all(
    ['ssn', 'credit', 'social'].map((type) => performSearch({ type, customerId, userId, authHeader }))
  )

  await retry(() =>
    sendReport({ customerId, userId, approvalRequestId, ssnSearchId, creditSearchId, socialSearchId, authHeader })
  )
}

async function performSearch(info: SearchInfo) {
  await retry(() => startSearch(info))
  const searchId = await retry(() => getSearchResult({ ...info, targetStatus: 'complete' }))
  return searchId
}

async function retry<T>(fn: () => Promise<T>): Promise<T> {
  let attempt = 1
  while (true) {
    try {
      return await fn()
    } catch (err) {
      console.error('Retrying:', (err as Error).message)
      const interval = 1000 * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, interval))
      attempt++
    }
  }
}
