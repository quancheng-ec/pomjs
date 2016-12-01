import DingTalkCrytor from './cryptor'

export default function suiteCallback(dingConfig, ctx) {

    const {token, encode_aes_key, suitekey, suitesecret} = dingConfig
    const {signature, timestamp, nonce} = ctx.query

    const dingCryptor = new DingTalkCrytor(token, encode_aes_key, suitekey, suitesecret)

    const decryptedInfo = dingCryptor.decrypt(ctx.request.body.encrypt).msg

    if (decryptedInfo.EventType === 'check_create_suite_url' || decryptedInfo.EventType === 'check_update_suite_url') {
        return resultWrapper(timestamp, nonce, decryptedInfo.Random)
    }

    return resultWrapper(timestamp, nonce, 'success')

    function resultWrapper(timestamp, nonce, text) {
        const encrypt = dingCryptor.encrypt(text)
        const msg_signature = dingCryptor.signature(timestamp, nonce, encrypt)
        return {msg_signature, timeStamp, nonce, encrypt}
    }
}
