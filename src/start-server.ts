import { runApiServer } from './api-server'
import { registerUser } from './register-user'
import { startRound } from './start-round'
import { Auth } from './types'

const args = process.argv.slice(2)
if (args.length !== 3) {
  console.error('Usage: npm start <username> <level> <ngrok-url>')
  process.exit(1)
}

const [username, level, ngrokUrl] = args

async function startServer() {
  const auth: Auth = { username: '', password: '' }
  await runApiServer({ username, ngrokUrl, auth })

  const authToken = await registerUser(username)
  auth.username = username
  auth.password = authToken

  await startRound({ level, ngrokUrl, auth })
}

startServer().catch((err) => {
  console.error(err)
  process.exit(1)
})
