import axios from 'axios'
import { API } from './constants'
import { AuthHeader } from './types'

export async function startRound({
  level,
  ngrokUrl,
  authHeader,
}: {
  level: string
  ngrokUrl: string
  authHeader: AuthHeader
}) {
  const response = await axios.post(`${API}/rounds`, { path: ngrokUrl, level }, authHeader)
  console.log('Round ID:', response.data.round)
}
