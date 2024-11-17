const express = require("express")
const http = require("http")
const { Client, RemoteAuth, MessageMedia } = require('whatsapp-web.js')


const { Server } = require("socket.io")
const mongoose = require('mongoose')
const { MongoStore } = require('wwebjs-mongo')

const app = express();
const port = 3001
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    }
})
const MONGODB_URI = "mongodb://localhost:27017/waapi_auth"

let store;

async function connectToMongoDB() {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB connected');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      process.exit(1); // Exit the process with an error code   
    }
  }

server.listen(port, () => {
    console.log(`tgklik wa api running on port::${port} mongo ${store}`)
})

const allSessionObj = {};
const createWhatsAppSession = (id, socket) => {
    const client = new Client({
        // puppeteer: {
        //     headless: false,
        // },
        authStrategy: new RemoteAuth({
            clientId: id,
            store: store,
            backupSyncIntervalMs: 300000,
        })
    });

    client.on('qr', (qr) => {
        console.log(qr)
        // socket.emit("qr", {
        //     qr,
        // });
    });
    
    client.on("authenticated", () => {
        console.log("authenticated")
    })

    client.on('ready', async () => {
        console.log('Client is ready!');
        allSessionObj[id] = client;

        const allChats = await client.getChats();
        console.log("send message")
        // socket.emit("ready", {id, message: "client is ready!"})
        const phoneNumber = '6285161992903@c.us'; // Replace with the desired phone number
        const message = 'Hello, world!';
    
        await client.sendMessage(phoneNumber, message);
        console.log(`done send message to ${phoneNumber}`)
    });

    client.on("remote_session_saved", () => {
        console.log("remote session saved");
        // socket.emit("remote_session_saved", {
        //     message: "remote_session_saved"
        // });
    })

    client.initialize();
};

const getWhatsappSession = (id) => {
    const client = new Client({
        puppeteer: {
            headless: false,
        },
        authStrategy: new RemoteAuth({
            clientId: id,
            store: store,
            backupSyncIntervalMs: 300000,
        })
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        socket.emit("ready", {id, message: "client is ready!"})
    });

    client.on('qr', (qr) => {
        console.log(qr)
        socket.emit("qr", {
            qr,
        });
    });

    client.initialize();
}

// client.on('message', msg => {
//     if (msg.body == '!ping') {
//         msg.reply('pong');
//     }
// });

io.on("connection", (socket) => {
    console.log("a user connected", socket?.id);

    socket.on("disconnect", () => {
        console.log("disconnect")
    });
    socket.on("connected", (data) => {
        console.log("connected to server", data);
        socket.emit("Hello", "Hello from the server")
    });
    socket.on("createSession", (data) => {
        const {id} = data;
        createWhatsAppSession(id, socket)
    });
    socket.on("getSession", (data) => {
        const {id} = data
        getWhatsappSession(id, socket)
    });
});

const sentMessage = (client) => {
    console.log("whatsapp sent message")

    client.on('ready', async () => {
        console.log("client ready")
        const phoneNumber = '085161992903'; // Replace with the desired phone number
        const message = 'Hello, world!';
    
        await client.sendMessage(phoneNumber, message);
    });
    
    // client.on('ready', async () => {

    //     const chatId = 'your_chat_id'; // Replace with the actual chat ID
    //     const message = 'Hello, world!';
    
    //     const chat = await client.getChatById(chatId);
    //     await chat.sendMessage(message);

    //     const media = MessageMedia.fromFilePath('./sample.png');
    //     await chat.sendMessage(media, 'Here\'s an image');
    // });

    client.initialize();
};

connectToMongoDB().then(() => {
    store = new MongoStore({ mongoose: mongoose });
    // const client = new Client({
    //     authStrategy: new RemoteAuth({
    //         store: store,
    //         backupSyncIntervalMs: 300000,
    //     }),
    // });

    // client.initialize()
    createWhatsAppSession("MNAJIB");
});