var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
    entry: {main: './pages/main.js'},
    output: {
        path: path.resolve(__dirname, './static/bundle/'),
        publicPath: '/bundle/',
        filename: "[name].bundle.js"

    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                  loaders: {
                    css: ExtractTextPlugin.extract({
                      loader: 'css-loader',
                      fallbackLoader: 'vue-style-loader'
                    })
                  }
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                query: {
                    name: '[name].[ext]?[hash]'
                }
            }
        ]
    },
    devServer: {
        historyApiFallback: true,
        noInfo: true
    },
    plugins:[
        new ExtractTextPlugin("[name].style.css")
    ],
    devtool: '#eval-source-map'
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
