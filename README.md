# Background Check TypeScript


### Running the code

- `temporal server start-dev` to start [Temporal Server](https://github.com/temporalio/cli/#installation)
- `git clone https://github.com/temporalio/background-check-typescript.git`
- `cd background-check-typescript`
- `npm install` to install dependencies
- `brew install ngrok` for Mac or [click here](https://ngrok.com/download) for other platforms
- `ngrok http 3000` to create a publicly accessible URL like `https://9226-71-190-188-101.ngrok.io`
- `npm start <username> <level> <ngrok URL> ` to start the server, for example:

  ```
  npm start loren 0 https://9226-71-190-188-101.ngrok.io
  ```