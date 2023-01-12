import axios from 'axios'
import { API } from './constants'
import { Player } from './types'

export async function registerUser(username: string): Promise<string> {
  const registration = await axios.post(`${API}/players/register`, { username })

  const player = registration.data as Player
  if (!player.auth_token) {
    console.error(registration)
    throw new Error('Failed to register')
  }

  return player.auth_token
}
