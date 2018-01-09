const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const autoprefixer = require('autoprefixer')
const fs = require('fs')
//var HashAssetsPlugin = require('hash-assets-webpack-plugin');
let jsName = '[name].bundle.js'
let cssName = '[name].style.css'
if (process.env.BUILD === 'true') {
  jsName = '[name].[chunkhash].bundle.js'
  cssName = '[name].[chunkhash].style.css'
}

module.exports = {
  entry: {
    vendor: ['vue', 'vue-resource']
  },
  output: {
    path: path.resolve('.', './static/bundle/'),
    publicPath: '/bundle/',
    filename: jsName
    //filename: "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            css: ExtractTextPlugin.extract({
              use: 'css-loader',
              fallback: 'vue-style-loader'
            }),
            stylus: ExtractTextPlugin.extract({
              use: 'css-loader!stylus-loader',
              fallback: 'vue-style-loader' // <- this is a dep of vue-loader, so no need to explicitly install if using npm3
            }),
            js: 'babel-loader'
          }
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: ['latest'],
          babelrc: false
        },
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
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
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
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest'
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true,
      context: __dirname,
      options: {
        vue: {
          postcss: [autoprefixer('last 3 versions', '> 1%')]
        },
        babel: {
          presets: ['latest'],
          babelrc: false
        }
      }
    })
  ],
  devtool: '#eval-source-map'
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
