import axios from 'axios'
import { API } from './constants'
import { Auth } from './types'

export async function startRound({ level, ngrokUrl, auth }: { level: string; ngrokUrl: string; auth: Auth }) {
  const response = await axios.post(`${API}/rounds`, { path: ngrokUrl, level }, { auth })
  console.log('Round ID:', response.data.round)
}
