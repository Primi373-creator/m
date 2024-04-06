const crypto = require('crypto');

function encryptText(text, key) {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encryptedText = cipher.update(text, 'utf-8', 'hex');
    encryptedText += cipher.final('hex');
    return encryptedText;
}

function decryptText(encryptedText, key) {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decryptedText = decipher.update(encryptedText, 'hex', 'utf-8');
    decryptedText += decipher.final('utf-8');
    return decryptedText;
}

function genid() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomId = '';
    for (let i = 0; i < 10; i++) {
        randomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomId;
}

module.exports = {
    encryptText,
    decryptText,
    genid
};
