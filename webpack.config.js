const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const autoprefixer = require('autoprefixer')
// var HashAssetsPlugin = require('hash-assets-webpack-plugin');
const isBuild = process.env.BUILD === 'true'
const isProd = process.env.NODE_ENV === 'production'

const jsName = isBuild ? '[name].[chunkhash].bundle.js' : '[name].bundle.js'
const cssName = isBuild ? '[name].[chunkhash].style.css' : '[name].style.css'

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
        loader: 'vue-loader',
        options: {
          extractCSS: isProd
        }
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: isProd
          ? ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: 'css-loader'
            })
          : ['style-loader', 'css-loader']
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
  ],
  devtool: '#cheap-module-source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#cheap-module-source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new ExtractTextPlugin(cssName),
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
