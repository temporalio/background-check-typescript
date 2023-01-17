import axios from 'axios'
import { API } from './constants'
import { StatusEnum, StatusConfirmation, SearchInfo, Auth } from './types'

export async function requestApproval({
  customerId,
  userId,
  auth,
}: {
  customerId: string
  userId: string
  auth: Auth
}): Promise<void> {
  const response = await axios.post(`${API}/notify/${customerId}/${userId}`, undefined, { auth, timeout: 1000 })
  console.log('📡 requestApproval response:', response.data)
}

export async function getApprovalStatus({
  customerId,
  userId,
  targetStatus,
  auth,
}: {
  customerId: string
  userId: string
  targetStatus: StatusEnum
  auth: Auth
}): Promise<string> {
  const response = await axios.get(`${API}/notify/${customerId}/${userId}`, { auth, timeout: 1000 })
  console.log('📡 getApprovalStatus response:', response.data)

  const data = response.data as StatusConfirmation
  switch (data.status) {
    case 'created':
    case 'started':
    case 'pending':
    case 'running':
      throw new Error('Approval still in progress')
    case targetStatus:
      return data.confirmation!
    default:
      throw new Error(`Unknown status: ${data.status}`)
  }
}

export async function startSearch({ type, customerId, userId, auth }: SearchInfo): Promise<void> {
  const response = await axios.post(`${API}/search/${type}/${customerId}/${userId}`, undefined, { auth, timeout: 1000 })
  console.log('📡 startSearch response:', response.data)
}

type PollSearchInfo = SearchInfo & { targetStatus: StatusEnum }

export async function getSearchResult({
  type,
  customerId,
  userId,
  targetStatus,
  auth,
}: PollSearchInfo): Promise<string> {
  const response = await axios.get(`${API}/search/${type}/${customerId}/${userId}`, {
    auth,
    timeout: 1000,
  })
  console.log('📡 getSearchResult response:', response.data)

  const data = response.data as StatusConfirmation
  switch (data.status) {
    case 'created':
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
  approvalId,
  ssnSearchId,
  creditSearchId,
  socialSearchId,
  auth,
}: {
  customerId: string
  userId: string
  approvalId: string
  ssnSearchId: string
  creditSearchId: string
  socialSearchId: string
  auth: Auth
}): Promise<void> {
  const response = await axios.post(
    `${API}/notify/report/${customerId}/${userId}`,
    {
      notification: approvalId,
      ssn: ssnSearchId,
      social: socialSearchId,
      credit: creditSearchId,
    },
    { auth, timeout: 1000 }
  )
  console.log('📡 sendReport response:', response.data)
}
