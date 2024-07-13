const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  devServer: {
    port: 8000,
    historyApiFallback: true,
    compress: false,
    proxy: {
      '/api': {
        target: 'https://cloudshare-api.local',
        pathRewrite: { '^/api': '' },
        secure: false,
        changeOrigin: true,
      },
      '/minio': {
        target: 'https://minio.local',
        pathRewrite: { '^/minio': '' },
        secure: false,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
