import { requestApproval, pollForApproval, startSearch, pollForSearchResult, sendReport } from './activities'
import { AuthHeader, SearchInfo } from './types'

interface BackgroundCheckInput {
  customerId: string
  userId: string
  authHeader: AuthHeader
}

export async function backgroundCheck({ customerId, userId, authHeader }: BackgroundCheckInput): Promise<void> {
  const approvalRequestId = await requestApproval({ customerId, userId, authHeader })
  await pollForApproval({ approvalRequestId, targetStatus: 'complete', authHeader })

  const ssnSearchId = await performSearch({ type: 'ssn', customerId, userId, authHeader })
  const creditSearchId = await performSearch({ type: 'credit', customerId, userId, authHeader })
  const socialSearchId = await performSearch({ type: 'social', customerId, userId, authHeader })

  await sendReport({ customerId, userId, approvalRequestId, ssnSearchId, creditSearchId, socialSearchId, authHeader })
}

async function performSearch(info: SearchInfo) {
  await startSearch(info)
  const searchResult = await pollForSearchResult({ ...info, targetStatus: 'complete' })
  return searchResult
}
