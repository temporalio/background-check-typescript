import { DefaultLogger, Runtime, Worker } from '@temporalio/worker'
import * as activities from './activities'

export async function runWorker() {
  // Hide Activity failure warnings:
  // Runtime.install({
  //   logger: new DefaultLogger('ERROR'),
  // })

  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'background-check',
  })

  await worker.run()
}
