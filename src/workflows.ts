import { requestApproval, pollForApproval, startSearch, pollForSearchResult, sendReport } from './activities'
import { SearchInfo } from './types'

interface BackgroundCheckInput {
  customerId: string
  userId: string
}

export async function backgroundCheck({ customerId, userId }: BackgroundCheckInput): Promise<void> {
  const approvalRequestId = await requestApproval({ customerId, userId })
  await pollForApproval({ approvalRequestId, targetStatus: 'complete' })

  const ssnSearchId = await performSearch({ type: 'ssn', customerId, userId })
  const [creditSearchId, socialSearchId] = await Promise.all([
    performSearch({ type: 'credit', customerId, userId }),
    performSearch({ type: 'social', customerId, userId }),
  ])

  await sendReport({ customerId, userId, approvalRequestId, ssnSearchId, creditSearchId, socialSearchId })
}

async function performSearch(info: SearchInfo) {
  await startSearch(info)
  const searchResult = await pollForSearchResult({ ...info, targetStatus: 'complete' })
  return searchResult
}
