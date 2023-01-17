import express from 'express'
import { Auth } from './types'
import { backgroundCheck } from './workflows'

type Action = 'start' | 'cancel'
interface BackgroundBody {
  customer: string
  user: string
  action: Action
}

interface ApiServerOptions {
  username: string
  ngrokUrl: string
  auth: Auth
  port?: number
}

export async function runApiServer({ username, ngrokUrl, auth, port = 3000 }: ApiServerOptions) {
  const app = express()
  app.use(express.json())

  app.get('/', async (_, res) => {
    res.send(`👋 I am <code>${username}</code> running an API server at <a href="${ngrokUrl}">${ngrokUrl}</a>`)
  })

  app.get('/confirm', async (_, res) => {
    console.log(`Receiving HTTP request: GET /confirm`)
    res.send({ username })
  })

  app.post('/background', async (req, res) => {
    console.log(`Receiving HTTP request: POST /background with body:`, req.body)
    const { customer: customerId, user: userId, action } = req.body as BackgroundBody
    if (action === 'start') {
      void backgroundCheck({ customerId, userId, auth })
    } else if (action === 'cancel') {
      // TODO: Cancel background check
    }
    res.status(200).end()
  })

  app.post('/complete', async (req, res) => {
    console.log(`Receiving HTTP request: POST /complete with body:`, req.body)
    console.log('Round complete!')
    res.status(200).end()
  })

  await new Promise<void>((resolve, reject) => {
    app.listen(port, resolve)
    app.on('error', reject)
  })

  console.log(`
API server listening at: 

- http://localhost:${port}
- ${ngrokUrl}
`)
}
