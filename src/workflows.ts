import { requestApproval, getApprovalStatus, startSearch, getSearchResult, sendReport } from './activities'
import { Auth, SearchInfo } from './types'

interface BackgroundCheckInput {
  customerId: string
  userId: string
  auth: Auth
}

export async function backgroundCheck({ customerId, userId, auth }: BackgroundCheckInput): Promise<void> {
  await requestApproval({ customerId, userId, auth })
  const approvalId = await getApprovalStatus({ customerId, userId, targetStatus: 'complete', auth })

  const ssnSearchId = await performSearch({ type: 'ssn', customerId, userId, auth })
  const creditSearchId = await performSearch({ type: 'credit', customerId, userId, auth })
  const socialSearchId = await performSearch({ type: 'social', customerId, userId, auth })

  await sendReport({ customerId, userId, approvalId, ssnSearchId, creditSearchId, socialSearchId, auth })
}

async function performSearch(info: SearchInfo) {
  await startSearch(info)
  const searchId = await getSearchResult({ ...info, targetStatus: 'complete' })
  return searchId
}
