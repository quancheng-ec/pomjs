import DingTalk from './../util/dingTalk'

export default function(opts) {
    return async function(ctx, next) {
        ctx.DingTalk = DingTalk(opts)
        await next()
    }
}
