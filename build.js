/**
 * Created by joe on 2016/10/17.
 */

const pageLoader = require('./src/util/pageLoader')
const fs = require('fs-sync')

module.exports = async function (opts = {}) {
  Object.assign(process.env, opts)
  opts.isProduction = true
  fs.copy(opts.src, opts.build, { force: true })

  pageLoader.init(opts)
  pageLoader.initCompile(opts)
  await pageLoader.compileRun(function (assets) {
    // console.log(assets.compilation.assets['po.style.css'])
  })
}
