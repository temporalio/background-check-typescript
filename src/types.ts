import { components } from './external-api'

export type Player = components['schemas']['Player']
export type StatusEnum = components['schemas']['StatusEnum']
export type StatusConfirmation = components['schemas']['StatusConfirmation']

export type Auth = { username: string; password: string }

export interface SearchInfo {
  type: string
  customerId: string
  userId: string
  auth: Auth
}
