const { default: MessagesClient } = require('google-messages-client')
const fs = require('fs')
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3000;
const client = new MessagesClient()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Send message
app.post('/send-message', async (req, res) => {
    try {
        const credentials = MessagesClient.loadCredentialFile('credentials.json')
        const clients = new MessagesClient({ credentials })

        const number = req.body.number;
        const message = req.body.message;

        clients.on('authenticated', async (service) => {
            const send = await service.sendMessage(number, message);
            await res.status(200).json({success: true, message: 'sent!'});
        });
    } catch (error){
        console.log(error);
    }
});

// Read message
app.get('/get-message', async (req, res) => {
    try {
        const credentials = MessagesClient.loadCredentialFile('credentials.json')
        const clients = new MessagesClient({ credentials })

        clients.on('authenticated', async (service) => {
            const inbox = await service.getInbox();
            await res.status(200).json({success: true, message: inbox});
        });
    } catch (error){
        console.log(error);
    }
});
  
io.on('connection', function(socket) {
    socket.emit('message', 'Connecting...');
    const isAuthenticated = fs.existsSync('connected.dat');

    if (isAuthenticated) {
        socket.emit('message', 'Client is Authenticated!');
        socket.emit('authenticated', 'Authenticated!')
        console.log('Authenticated')
    } else {
        client.on('qr-code', (base64Image) => {
            console.log('QR Code received, scan please!');
            socket.emit('qrCode', base64Image);
            socket.emit('message', 'QR Code received, scan please!');
        })
        client.on('authenticated', async () => {
            const credentials = await client.getCredentials()
            fs.writeFileSync('credentials.json', JSON.stringify(credentials, null, '\t'))
            fs.writeFileSync('connected.dat', '1')
            socket.emit('message', 'Client is Authenticated!');
            socket.emit('authenticated', 'Authenticated!')
            console.log('Authenticated')
        })
    }
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
