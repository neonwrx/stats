const webpack = require('webpack');
const merge = require('webpack-merge');

const helpers = require('./helpers');
// const commonConfig = require('./webpack.common');
const commonConfig = {};

module.exports = merge(commonConfig, {
  mode: 'production',

  output: {
    filename: 'js/[name].[hash].js',
    chunkFilename: '[id].[hash].chunk.js'
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
        screw_ie8: true
      },
      output: {
        comments: false
      }
    })
  ]
});
