export default class DingTalkSuite {
    constructor(suiteConfig) {
        this.suiteKey = suiteConfig.suiteKey
        this.suiteSecret = suiteConfig.suiteSecret
    }

    getTicket() {}

    async getAccessToken() {}

    async getPermanentCode(tmp_auth_code) {}

    async getCorpToken() {}
}
