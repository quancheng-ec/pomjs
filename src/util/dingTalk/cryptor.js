/**
 * DingTalkCrytor 加解密类
 */
import crypto from 'crypto'

const createSuiteKey = 'suite4xxxxxxxxxxxxxxx'
const crypto = require('crypto')
const algorithm = 'aes-256-cbc'

const PADDING = [
    [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
    [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
    [14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14],
    [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13],
    [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11],
    [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    [9, 9, 9, 9, 9, 9, 9, 9, 9],
    [8, 8, 8, 8, 8, 8, 8, 8],
    [7, 7, 7, 7, 7, 7, 7],
    [6, 6, 6, 6, 6, 6],
    [5, 5, 5, 5, 5],
    [4, 4, 4, 4],
    [3, 3, 3],
    [2, 2],
    [1],
  ]

const RANDCHARS = 'abcdefghigjklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

const pkcs7 = {
    pad(plaintext) {
        const padding = PADDING[(plaintext.byteLength % 16) || 0]
        const result = new Uint8Array(plaintext.byteLength + padding.length);
        result.set(plaintext);
        result.set(padding, plaintext.byteLength);
        return new Buffer(result);
    },
    unpad(padded) {
        return padded.subarray(0, padded.byteLength - padded[padded.byteLength - 1]);
    }
}

function _randomStr(length) {
    let rst = '';
    while (length--) {
        rst += RANDCHARS.charAt(Math.floor(Math.random() * RANDCHARS.length));
    }
    return rst;
}

export function encrypt(key, iv, data, suitekey) {
    if (!data)
        return '';
    suitekey = suitekey || createSuiteKey;
    const cipher = crypto.createCipheriv(algorithm, key, iv),
        random = _randomStr(16),
        buf1 = new Buffer(20),
        buf2 = new Buffer(data),
        buf3 = new Buffer(suitekey)

    let buf

    buf1.write(random, 0);
    buf1.writeInt32BE(buf2.byteLength, 16);

    cipher.setAutoPadding(false);
    buf = pkcs7.pad(Buffer.concat([buf1, buf2, buf3]));

    const bufencode = buf.toString('utf8')

    let crypted = cipher.update(bufencode, 'utf8', 'binary');
    crypted += cipher.final('binary');
    crypted = new Buffer(crypted, 'binary').toString('base64');
    return crypted;
}

export function decrypt(key, iv, crypted) {
    crypted = new Buffer(crypted, 'base64').toString('binary');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAutoPadding(false);

    const buf1 = decipher.update(crypted, 'binary'),
        buf2 = decipher.final(),
        decoded = Buffer.concat([buf1, buf2]);
    return new Buffer(pkcs7.unpad(decoded));
}

export default class DingTalkCrytor {
    constructor(token, encode_aes_key, suitekey, suitesecret) {
        this.token = token;
        this.key = new Buffer(encode_aes_key + '=', 'base64');
        this.iv = this.key.slice(0, 16);
        this.suitekey = suitekey;
        this.suitesecret = suitesecret;
    }

    decrypt(encrypted) {
        const out = decrypt(this.key, this.iv, encrypted),
            before = out.slice(0, 16),
            len = out.readInt32BE(16),
            msg = out.slice(20, 20 + len).toString('utf8'),
            after = out.slice(20 + len);
        let info
        try {
            info = JSON.parse(msg);
        } catch (e) {
            info = msg;
        }
        return {before: before.toString('utf8'), msg: info, after: after.toString('utf8')};
    }

    encrypt(plain) {
        return encrypt(this.key, this.iv, plain, this.suitekey);
    }

    signature(encrypt, nonce, timestamp) {
        const sha1 = crypto.createHash('sha1');
        const arr = [this.token, encrypt, nonce, timestamp].sort();
        sha1.update(arr.join(''));
        return sha1.digest('hex');
    }
}
