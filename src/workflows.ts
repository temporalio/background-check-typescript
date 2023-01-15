import { requestApproval, getApprovalStatus, startSearch, getSearchResult, sendReport } from './activities'
import { Auth, SearchInfo } from './types'

interface BackgroundCheckInput {
  customerId: string
  userId: string
  auth: Auth
}

export async function backgroundCheck({ customerId, userId, auth }: BackgroundCheckInput): Promise<void> {
  await requestApproval({ customerId, userId, auth })
  const approvalId = await retry(() => getApprovalStatus({ customerId, userId, targetStatus: 'complete', auth }))

  const [ssnSearchId, creditSearchId, socialSearchId] = await Promise.all(
    ['ssn', 'credit', 'social'].map((type) => performSearch({ type, customerId, userId, auth }))
  )

  await retry(() => sendReport({ customerId, userId, approvalId, ssnSearchId, creditSearchId, socialSearchId, auth }))
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
