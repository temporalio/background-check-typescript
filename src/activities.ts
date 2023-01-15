import axios from 'axios'
import { API } from './constants'
import { StatusEnum, StatusConfirmation, SearchInfo, Auth } from './types'

type PollSearchInfo = SearchInfo & { targetStatus: StatusEnum }

export const createActivities = (auth: Auth) => ({
  async requestApproval({ customerId, userId }: { customerId: string; userId: string }): Promise<void> {
    const response = await axios.post(`${API}/notify/${customerId}/${userId}`, undefined, { auth, timeout: 1000 })
    console.log('📡 requestApproval response:', response.data)
  },

  async getApprovalStatus({
    customerId,
    userId,
    targetStatus,
  }: {
    customerId: string
    userId: string
    targetStatus: StatusEnum
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
  },

  async startSearch({ type, customerId, userId }: SearchInfo): Promise<void> {
    const response = await axios.post(`${API}/search/${type}/${customerId}/${userId}`, undefined, {
      auth,
      timeout: 1000,
    })
    console.log('📡 startSearch response:', response.data)
  },

  async getSearchResult({ type, customerId, userId, targetStatus }: PollSearchInfo): Promise<string> {
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
  },

  async sendReport({
    customerId,
    userId,
    approvalId,
    ssnSearchId,
    creditSearchId,
    socialSearchId,
  }: {
    customerId: string
    userId: string
    approvalId: string
    ssnSearchId: string
    creditSearchId: string
    socialSearchId: string
  }): Promise<void> {
    const response = await axios.post(
      `${API}/notify/report`,
      {
        customer: customerId,
        user: userId,
        notify: approvalId,
        ssn: ssnSearchId,
        social: socialSearchId,
        credit: creditSearchId,
      },
      { auth, timeout: 1000 }
    )
    console.log('📡 sendReport response:', response.data)
  },
})
