import axios from 'axios'
import { API } from './constants'
import { Status, StatusEnum, StatusConfirmation, SearchInfo, AuthHeader } from './types'

type PollSearchInfo = SearchInfo & { targetStatus: StatusEnum }

export const createActivities = (authHeader: AuthHeader) => ({
  async requestApproval({ customerId, userId }: { customerId: string; userId: string }): Promise<string> {
    const response = await axios.post(`${API}/notify`, { customer: customerId, user: userId }, authHeader)
    console.log('📡 requestApproval response:', response.data)
    const requestId = response.data.uuid
    return requestId
  },

  async getApprovalStatus({
    approvalRequestId,
    targetStatus,
  }: {
    approvalRequestId: string
    targetStatus: StatusEnum
  }): Promise<void> {
    const response = await axios.get(`${API}/notify/${approvalRequestId}`, authHeader)
    console.log('📡 getApprovalStatus response:', response.data)

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
  },

  async startSearch({ type, customerId, userId }: SearchInfo): Promise<void> {
    await axios.post(`${API}/search/${type}`, { customer: customerId, user: userId }, authHeader)
  },

  async getSearchResult({ type, customerId, userId, targetStatus }: PollSearchInfo): Promise<string> {
    const response = await axios.get(`${API}/search/${type}`, {
      params: { user: userId, customer: customerId },
      ...authHeader,
    })
    console.log('📡 getSearchResult response:', response.data)

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
  },

  async sendReport({
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
    console.log('📡 sendReport response:', response.data)
  },
})
