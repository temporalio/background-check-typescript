import { Context } from '@temporalio/activity'
import axios from 'axios'
import { API } from './constants'
import { Status, StatusEnum, StatusConfirmation, SearchInfo } from './types'

export async function requestApproval({ customerId, userId }: { customerId: string; userId: string }): Promise<string> {
  const response = await axios.post(
    `${API}/notify`,
    { customer: customerId, user: userId },
    { signal: Context.current().cancellationSignal }
  )
  console.log('▶️ requestApproval response:', response.data)
  const requestId = response.data.uuid
  return requestId
}

export async function pollForApproval({
  approvalRequestId,
  targetStatus,
}: {
  approvalRequestId: string
  targetStatus: StatusEnum
}): Promise<void> {
  const response = await axios.get(`${API}/notify/${approvalRequestId}`, {
    signal: Context.current().cancellationSignal,
  })
  console.log('▶️ pollForApproval response:', response.data)
  const status = (response.data as Status).status
  if (status !== targetStatus) {
    throw new Error('Approval still in progress')
  }
}

export async function startSearch({ type, customerId, userId }: SearchInfo): Promise<void> {
  await axios.post(
    `${API}/search/${type}`,
    { customer: customerId, user: userId },
    { signal: Context.current().cancellationSignal }
  )
}

type PollSearchInfo = SearchInfo & { targetStatus: StatusEnum }

export async function pollForSearchResult({ type, customerId, userId, targetStatus }: PollSearchInfo): Promise<string> {
  const response = await axios.get(`${API}/search/${type}`, {
    params: { user: userId, customer: customerId },
    signal: Context.current().cancellationSignal,
  })
  console.log('▶️ pollForSearchResult response:', response.data)
  const data = response.data as StatusConfirmation
  if (data.status !== targetStatus) {
    throw new Error('Search still in progress')
  }

  return data.confirmation! // eslint-disable-line @typescript-eslint/no-non-null-assertion
}

export async function sendReport({
  customerId,
  userId,
  approvalRequestId,
  ssnSearchId,
  creditSearchId,
  socialSearchId,
}: {
  customerId: string
  userId: string
  approvalRequestId: string
  ssnSearchId: string
  creditSearchId: string
  socialSearchId: string
}): Promise<void> {
  const response = await axios.post(`${API}/notify/report`, {
    customer: customerId,
    user: userId,
    notify: approvalRequestId,
    ssn: ssnSearchId,
    social: socialSearchId,
    credit: creditSearchId,
  })
  console.log('▶️ sendReport response:', response.data)
}
