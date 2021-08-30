const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const isLocal = slsw.lib.webpack.isLocal;

module.exports = {
  mode: 'production',
  entry: slsw.lib.entries,
  target: 'node',
  externalsPresets: { node: true },
  externals: [
    nodeExternals({
      /* Fabric.js in Lambda Layer, not required in bundle. */
      allowlist: isLocal ? [] : ['lambda-api'],
    }),
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '.webpack'),
    assetModuleFilename: '[file]',
    libraryTarget: 'commonjs',
  },
  resolve: {
    extensions: ['.ts', '.js', '.svg', '.ttf', '.png'],
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg|png)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
      },
      {
        test: /\.svg/,
        type: 'asset/inline',
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({ PRODUCTION: !slsw.lib.webpack.isLocal }),
    new CopyPlugin({
      patterns: [
        {
          from: 'src/assets/fonts/fonts.conf',
          to: 'src/assets/fonts/fonts.conf',
        },
      ],
    }),
  ],
};
