const webpack = require('webpack')
const path = require('path')

module.exports = {
  devtool: 'source-map',
  entry: {
    'intercept-fetch': './index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'bundles'),
    publicPath: '/',
    filename: '[name].umd.min.js',
    sourceMapFilename: '[file].map',
    libraryTarget: 'umd',
    library: 'intercept-fetch'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/, use: 'ts-loader'
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: ['intercept-fetch']
    }),

    new webpack.optimize.UglifyJsPlugin({
      beautify: false, // prod

      mangle: {
        screw_ie8: true
      }, // prod
      compress: {
        warnings: false,
        screw_ie8: true
      }, // prod
      comments: false // prod
    })
  ]

}
