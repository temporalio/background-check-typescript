import { runApiServer } from './api-server'
import { registerUser } from './register-user'
import { startRound } from './start-round'

const args = process.argv.slice(2)
if (args.length !== 3) {
  console.error('Usage: npm start <username> <level> <ngrok-url>')
  process.exit(1)
}

const [username, level, ngrokUrl] = args

async function startServer() {
  await runApiServer({ username, ngrokUrl })

  const authToken = await registerUser(username)
  await startRound({ authToken, level, ngrokUrl })
}

startServer().catch((err) => {
  console.error(err)
  process.exit(1)
})
