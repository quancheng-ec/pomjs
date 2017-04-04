const webpack = require('webpack')
const merge = require('webpack-merge')
const base = require('./webpack.base.config')
const VueSSRPlugin = require('vue-ssr-webpack-plugin')

module.exports = merge(base, {
  target: 'node',
  devtool: '#source-map',
  entry: '/Users/joe/work/pomjs/example/pages/index/entry-server',
  output: {
    path: '/Users/joe/work/pomjs/example/dist',
    filename: 'server-bundle.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    alias: {
      //'create-api': './create-api-server.js'
    }
  },
  externals: Object.keys(require('../../../../package.json').dependencies),
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"server"'
    }),
    new VueSSRPlugin()
  ]
})
