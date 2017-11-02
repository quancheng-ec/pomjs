var path = require('path')
var webpack = require('webpack')

module.exports = {
  target: 'node', // !different

  entry: {
    vendor: ['vue', 'vue-resource', 'whatwg-fetch']
  },
  output: {
    path: path.resolve(__dirname, './dist/'),
    publicPath: '/bundle/',
    filename: '[name].bundle.js',
    libraryTarget: 'commonjs2' // !different
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
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
  }
  // devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
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
