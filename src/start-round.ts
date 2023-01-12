import axios from 'axios'
import { API } from './constants'

export async function startRound({
  authToken,
  level,
  ngrokUrl,
}: {
  authToken: string
  level: string
  ngrokUrl: string
}) {
  const response = await axios.post(
    `${API}/rounds`,
    { path: ngrokUrl, level },
    { headers: { Authorization: `Basic ${authToken}` } }
  )
  console.log('Round ID:', response.data.round)
}
