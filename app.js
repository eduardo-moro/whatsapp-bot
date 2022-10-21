
const express = require('express');
const fs = require('fs');
const createError = require('http-errors');
const morgan = require('morgan');
const { Client, NoAuth } = require('whatsapp-web.js');

const qrcode = require('qrcode-terminal')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false })

require('dotenv').config();

const app = express();
app.use(express.static('public'))

const client = new Client({
    puppeteer: { headless: true },
    authStrategy: new NoAuth(),
});

client.initialize();

client.on('qr', qr => {
  // NOTE: This event will not be fired if a session is specified.
  console.log('QR RECEIVED', qr);
  qrcode.generate(qr, { small: true }); // Add this line
  app.get('/getqr', (req, res, next) => {
    res.send({ qr });
  });
});

client.on('authenticated', session => {
  console.log('AUTHENTICATED', session);
});

client.on('auth_failure', msg => {
  // Fired if session restore was unsuccessfull
  console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
  console.log('READY');
});

app.post('/sendmessage', jsonParser, async (req, res) => {
  try {
    await console.log(req.body);
    const { number, message } = req.body; // Get the body
    const msg = await client.sendMessage(`${number}@c.us`, message); // Send the message
    res.send({ msg }); // Send the response
  } catch (error) {
    console.log(error);
  }
});

// Listening for the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));


module.exports = app;
