import axios from 'axios'
import { API } from './constants'
import { Status, StatusEnum, StatusConfirmation, SearchInfo, AuthHeader } from './types'

export async function requestApproval({
  customerId,
  userId,
  authHeader,
}: {
  customerId: string
  userId: string
  authHeader: AuthHeader
}): Promise<string> {
  const response = await axios.post(`${API}/notify`, { customer: customerId, user: userId }, authHeader)
  console.log('▶️ requestApproval response:', response.data)
  const requestId = response.data.uuid
  return requestId
}

export async function getApprovalStatus({
  approvalRequestId,
  targetStatus,
  authHeader,
}: {
  approvalRequestId: string
  targetStatus: StatusEnum
  authHeader: AuthHeader
}): Promise<void> {
  const response = await axios.get(`${API}/notify/${approvalRequestId}`, authHeader)
  console.log('▶️ pollForApproval response:', response.data)

  const status = (response.data as Status).status
  switch (status) {
    case 'started':
    case 'pending':
    case 'running':
      throw new Error('Approval still in progress')
    case targetStatus:
      return
    default:
      throw new Error(`Unknown status: ${status}`)
  }
}

export async function startSearch({ type, customerId, userId, authHeader }: SearchInfo): Promise<void> {
  await axios.post(`${API}/search/${type}`, { customer: customerId, user: userId }, authHeader)
}

type PollSearchInfo = SearchInfo & { targetStatus: StatusEnum }

export async function getSearchResult({
  type,
  customerId,
  userId,
  targetStatus,
  authHeader,
}: PollSearchInfo): Promise<string> {
  const response = await axios.get(`${API}/search/${type}`, {
    params: { user: userId, customer: customerId },
    ...authHeader,
  })
  console.log('▶️ pollForSearchResult response:', response.data)

  const data = response.data as StatusConfirmation
  switch (data.status) {
    case 'started':
    case 'pending':
    case 'running':
      throw new Error('Search still in progress')
    case targetStatus:
      return data.confirmation!
    default:
      throw new Error(`Unknown status: ${data.status}`)
  }
}

export async function sendReport({
  customerId,
  userId,
  approvalRequestId,
  ssnSearchId,
  creditSearchId,
  socialSearchId,
  authHeader,
}: {
  customerId: string
  userId: string
  approvalRequestId: string
  ssnSearchId: string
  creditSearchId: string
  socialSearchId: string
  authHeader: AuthHeader
}): Promise<void> {
  const response = await axios.post(
    `${API}/notify/report`,
    {
      customer: customerId,
      user: userId,
      notify: approvalRequestId,
      ssn: ssnSearchId,
      social: socialSearchId,
      credit: creditSearchId,
    },
    authHeader
  )
  console.log('▶️ sendReport response:', response.data)
}
