import { DefaultLogger, Runtime, Worker } from '@temporalio/worker'
import { createActivities } from './activities'
import { Auth } from './types'

export async function runWorker(auth: Auth) {
  // Hide Activity failure warnings:
  Runtime.install({
    logger: new DefaultLogger('ERROR'),
  })

  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities: createActivities(auth),
    taskQueue: 'background-check',
  })

  await worker.run()
}
