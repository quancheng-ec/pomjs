var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var autoprefixer = require('autoprefixer')
// var HashAssetsPlugin = require('hash-assets-webpack-plugin');
let jsName = '[name].bundle.js'
let cssName = '[name].style.css'

const isProd = process.env.NODE_ENV === 'production'

if (process.env.BUILD === 'true') {
  jsName = '[name].[chunkhash].bundle.js'
  cssName = '[name].[chunkhash].style.css'
}

module.exports = {
  entry: {
    vendor: ['vue', 'vue-resource', 'whatwg-fetch']
  },
  output: {
    path: path.resolve('.', './static/bundle/'),
    publicPath: '/bundle/',
    filename: jsName
    // filename: "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            extractCSS: true
          }
        }
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]?[hash]'
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.js',
      'vue-resource$': 'vue-resource/dist/vue-resource.common.js'
    },
    symlinks: false
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  plugins: [
    new ExtractTextPlugin(cssName),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true,
      context: __dirname,
      options: {
        vue: {
          postcss: [autoprefixer('last 3 versions', '> 1%')]
        }
      }
    })
  ]
  // devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#cheap-module-source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ])
}
