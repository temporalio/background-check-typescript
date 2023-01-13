import { DefaultLogger, Runtime, Worker } from '@temporalio/worker'
import { createActivities } from './activities'
import { AuthHeader } from './types'

export async function runWorker(authHeader: AuthHeader) {
  // Hide Activity failure warnings:
  Runtime.install({
    logger: new DefaultLogger('ERROR'),
  })

  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities: createActivities(authHeader),
    taskQueue: 'background-check',
  })

  await worker.run()
}
