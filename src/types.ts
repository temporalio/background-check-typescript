import { components } from './external-api'

export type Player = components['schemas']['Player']
export type Status = components['schemas']['Status']
export type StatusEnum = components['schemas']['StatusEnum']
export type StatusConfirmation = components['schemas']['StatusConfirmation']

export type AuthHeader = { headers: { Authorization: string } }

export interface SearchInfo {
  type: string
  customerId: string
  userId: string
  authHeader: AuthHeader
}
