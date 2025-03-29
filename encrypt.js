import express from 'express';
import * as openpgp from 'openpgp';

const router = express.Router();

router.post('/encrypt', async (req, res) => {
    const { emailContent, publicKeyArmored } = req.body;

    try {
        const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
        const encrypted = await openpgp.encrypt({
            message: await openpgp.createMessage({ text: emailContent }),
            encryptionKeys: publicKey
        });

        res.json({ encryptedMessage: encrypted });
    } catch (error) {
        console.error("Encryption Error:", error);
        res.status(500).json({ error: "Encryption failed" });
    }
});

export default router;
