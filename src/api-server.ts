import express from 'express'
import { Client } from '@temporalio/client'
import { backgroundCheck } from './workflows'

type Action = 'start' | 'cancel'
interface BackgroundBody {
  customerId: string
  userId: string
  action: Action
}

export async function runApiServer({ username, ngrokUrl, port = 3000 }: any) {
  const client = new Client()

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
    const { customerId, userId, action } = req.body as BackgroundBody
    const workflowId = `${customerId}__${userId}`
    if (action === 'start') {
      await client.workflow.start(backgroundCheck, {
        args: [{ customerId, userId }],
        taskQueue: 'background-check',
        workflowId,
      })
    } else if (action === 'cancel') {
      const workflow = client.workflow.getHandle(workflowId)
      await workflow.cancel()
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
