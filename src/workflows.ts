import { requestApproval, getApprovalStatus, startSearch, getSearchResult, sendReport } from './activities'
import { Auth, SearchInfo } from './types'

interface BackgroundCheckInput {
  customerId: string
  userId: string
  auth: Auth
}

export async function backgroundCheck({ customerId, userId, auth }: BackgroundCheckInput): Promise<void> {
  await requestApproval({ customerId, userId, auth })
  const approvalId = await poll(() => getApprovalStatus({ customerId, userId, targetStatus: 'complete', auth }))

  const [ssnSearchId, creditSearchId, socialSearchId] = await Promise.all(
    ['ssn', 'credit', 'social'].map((type) => performSearch({ type, customerId, userId, auth }))
  )

  await sendReport({ customerId, userId, approvalId, ssnSearchId, creditSearchId, socialSearchId, auth })
}

async function performSearch(info: SearchInfo) {
  await startSearch(info)
  const searchId = await poll(() => getSearchResult({ ...info, targetStatus: 'complete' }))
  return searchId
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
