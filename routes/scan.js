const express = require("express");
const path = require("path");
const { toBuffer } = require("qrcode");
const axios = require("axios");
const fs = require("fs");
const pino = require("pino");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const { exec } = require("child_process");
const router = express.Router();
const Session = require("./lib/session");
const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  delay,
  useMultiFileAuthState,
  makeInMemoryStore,
} = require("@whiskeysockets/baileys");
const { genid, encryptText } = require('./lib/session');
router.use(express.json());

router.get('/', async (req, res) => {
    try {
        await mongoose.connect('mongodb://localhost/your_database_name', { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
        await handleRequest(req, res);
        mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        res.status(500).send('Failed to connect to MongoDB');
    }
});

async function handleRequest(req, res) {
    async function Guru() {
        const { state, saveCreds } = await useMultiFileAuthState('./SESSION');
        try {
            let conn = makeWASocket({
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }),
                auth: state,
                browser: [`C-iph3r`, "Safari", "3.0"],
              }); 
            conn.ev.on('connection.update', async (s) => {
                console.log(s);
                if (s.qr !== undefined) {
                    res.end(await toBuffer(s.qr));
                  }
                  const { connection, lastDisconnect } = s;
                if (connection === 'open') {
                    const tid = genid();
                    const sessionId = encryptText(tid, yourEncryptionKey);
                    const credsFilePath = path.join(__dirname, 'SESSION', 'creds.json');
                    const botsession = JSON.parse(fs.readFileSync(credsFilePath));

                    try {
                        const session = new Session({
                            id: tid, 
                            sessionId: sessionId,
                            creds: JSON.stringify(botsession),
                        });
                        const savedSession = await session.save();
                        console.log('Session saved successfully:', savedSession._id);
                        let alphatxt = `alpha~${sessionId}`;
                        await conn.sendMessage(conn.user.id, { text: alphatxt });
                        await conn.sendMessage(conn.user.id,{ audio: { url: "./voice.mp3" }, mimetype: 'audio/mp4', caption: alphatxt },);
                    } catch (error) {
                        console.error('Error saving session:', error);
                        res.status(500).send('Internal Server Error');
                    }
                }

                if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await Guru();
                }
            });

            conn.ev.on('creds.update', saveCreds);
            conn.ev.on('messages.upsert', () => {});
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }

    Guru();
});

module.exports = router;
