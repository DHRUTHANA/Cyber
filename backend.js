import express from 'express';
import encryptRouter from './encrypt.js';

import { google } from 'googleapis';
import * as openpgp from 'openpgp';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;  // Dynamic port
app.use(cors());

// Set Cross-Origin-Opener-Policy header
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

app.use(express.json());  // ✅ Allows JSON requests

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send']
  });
  res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  res.send('Authentication successful! You can now send emails.');
});

async function encryptEmail(emailContent, publicKeyArmored, publicKey) {

  try {
    const response = await axios.get("http://localhost:5000/get-public-key");
    console.log("Fetched Public Key:", response.data);
    const publicKey = await openpgp.readKey({ armoredKey: publicKey.trim() });


    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: emailContent }),
      encryptionKeys: publicKey
      
    });
    console.log("Sending Public Key:", publicKey);


    return encrypted;
  } catch (error) {
    console.error("Encryption Error:", error);
  }
}

app.get('/get-public-key', async (req, res) => {
  try {
    console.log("Public Key request received"); // ✅ Debugging log

    const publicKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----
    
    
    -----END PGP PUBLIC KEY BLOCK-----`;

    if (!publicKey.includes("BEGIN PGP PUBLIC KEY BLOCK")) {
      throw new Error("Invalid PGP Public Key Format");
    }

    res.send(publicKey.trim()); // ✅ Remove extra spaces
  } catch (error) {
    console.error("Error in /get-public-key:", error.message);
    res.status(500).send({ error: "Failed to retrieve public key" });
  }
});


async function sendEncryptedEmail(recipient, encryptedMessage) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const rawMessage = Buffer.from(
    `To: ${recipient}\r\n` +
    `Subject: Encrypted Email\r\n` +
    `MIME-Version: 1.0\r\n` +
    `Content-Type: text/plain; charset="UTF-8"\r\n\r\n` +
    `${encryptedMessage}`
  ).toString('base64');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: rawMessage },
  });

  console.log('Email sent successfully!');
}

// ✅ Moved outside of `sendEncryptedEmail`
app.post('/send-email', async (req, res) => {
  console.log("Received request to send email");  // ✅ Debugging log

  try {
    await sendEncryptedEmail(req.body.recipient, req.body.encryptedMessage);
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use('/api', encryptRouter); // Add the encryption endpoint

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
