/**
 * Created by joe on 16/9/23.
 */

import fs from 'fs'
const Path = require('path')
const renderer = require('vue-server-renderer').createRenderer()
const createBundleRenderer = require('vue-server-renderer').createBundleRenderer
const cache = {}
const pageLoader = require('../util/pageLoader')

const renderPromise = function(pageName, code, context) {
  return new Promise(function(resolve, reject) {
    let cr = cache[pageName]
    if (!cr || !pageLoader.isProduction()) {
      cr = createBundleRenderer(code)
      cache[pageName] = cr
    }
    cr.renderToString(context, (err, html) => {
      if (err) return reject(err)
      resolve(html)
    })
  })
}

export default function(opts = {}) {
  const layouts = opts.layouts || Path.join(opts.root, 'layouts')
  if (!opts.isProduction) {
    pageLoader.initCompile(opts)
  }

  return async function render(ctx, next) {
    if (!ctx.context) {
      await next()
      return
    }

    let timer = new ctx.logger.Timer({
      group: 'render'
    })

    const pageContext = ctx.context.pageContext

    let body = fs
      .readFileSync(Path.join(layouts, ctx.context.layout || 'default.html'))
      .toString()
    body = body.replace('{{ title }}', ctx.context.title || 'hello pomjs!')
    body = body.replace('{{ keywords }}', ctx.context.keywords || '')
    body = body.replace('{{ description }}', ctx.context.description || '')

    const chunkNames = ['manifest', 'vendor', 'common', pageContext.pageName]

    const sr = chunkNames
      .map(c => {
        let cPath = pageLoader.getClientFilePath(`${c}.bundle.js`)
        if (!cPath) return ''
        return `<script src="${opts.cdndomain || ''}${cPath}"></script>`
      })
      .join('\n')

    const css = chunkNames
      .map(c => {
        if (process.env.NODE_ENV === 'production') {
          let cPath = pageLoader.getClientFilePath(`${c}.style.css`)
          if (!cPath) return ''
          return `<link 
            href="${opts.cdndomain || ''}${cPath}" rel='stylesheet'>
          </link>`
        }
        let cPath = pageLoader.readClientFile(`${c}.style.css`)
        if (!cPath) return ''
        return cPath.toString()
      })
      .join('\n')

    const contextData = `<script>
      var __vue_context_data=${JSON.stringify(ctx.context)}
    </script>`

    body = body.replace('{{ page.js }}', contextData + sr)

    if (process.env.NODE_ENV !== 'production') {
      await pageLoader.compileRun()
    }

    const html = await renderPromise(
      `${pageContext.pageName}.bundle.js`,
      pageLoader.readServerFileSync(`${pageContext.pageName}.bundle.js`),
      ctx.context
    )

    body = body.replace('{{ html }}', html)

    body = body.replace(
      '{{ stylesheet }}',
      process.env.NODE_ENV === 'production'
        ? css
        : `<style rel='stylesheet'>${css}</style>`
    )

    ctx.body = body

    ctx.type = 'text/html; charset=utf-8'

    timer.split()
  }
}
