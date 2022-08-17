// @ts-check
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
// import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

const mode = process.env.NODE_ENV || 'development';

export default {
  mode,
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  output: {
    libraryExport: 'default',
  },
  plugins: [new MiniCssExtractPlugin()], // new NodePolyfillPlugin()
  resolve: {
    fallback: {
      fs: false,
      path: false,
      http: false,
      https: false,
      crypto: false,
      timers: false,
      stream: false,
      os: false,
      console: false,
      url: false,
      tty: false,
    },
  },
};
