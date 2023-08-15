# Google Message Rest API

### How to use
- npm i
- node server.js

### Example

- Get session

```js
const { default: MessagesClient } = require('google-messages-client')
const fs = require('fs')

const client = new MessagesClient()

client.on('qr-code', (base64Image) => {
    // example code to save image
    fs.writeFileSync('qr.jpg', base64Image.replace(/^data:image\/png;base64,/, ""), { encoding: 'base64' })
    // your code
})

client.on('authenticated', async () => {
    const credentials = await client.getCredentials()
    fs.writeFileSync('credentials.json', JSON.stringify(credentials, null, '\t'))
    await client.quit()
})
```
You must have `credentials.json` or session file for accessing the feature. 

- Read messages

```js
const { default: MessagesClient } = require('google-messages-client')

const credentials = MessagesClient.loadCredentialFile('credentials.json')
const client = new MessagesClient({ credentials })

client.on('authenticated', async (service) => {
    const inbox = await service.getInbox()
    console.log('Inbox', inbox)
    await client.quit()
})
```

- Send messages

```js
const { default: MessagesClient } = require('google-messages-client')

const credentials = MessagesClient.loadCredentialFile('credentials.json')
const client = new MessagesClient({ credentials })

client.on('authenticated', async (service) => {
    console.log('Sending message...')
    await service.sendMessage('+1337', 'Test message from SMS Client.') 
    console.log('Done!')
    await client.quit()
})
```

**Note**: `sendMessage` takes first arg as number with `countryCode + Number` second arg as TextMessage
