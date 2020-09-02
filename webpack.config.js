const path = require('path');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {
  appConfig: {
    title: htmlTitle = '',
    distDirectory,
  }
} = require('./package.json');

const frontBase = {
  entry: {
    app: [path.resolve(__dirname, 'src/main.ts')],
  },
  output: {
    path: path.resolve(__dirname, distDirectory, 'public/'),
    publicPath: './',
    filename: 'assets/js/bundle.js'
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: './index.html',
      template: './src/index.ejs',
      title: htmlTitle,
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'awesome-typescript-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets/images',
            },
          },
        ],
      },
      {
        test: /\.svg/i,
        include: [
          path.resolve('./assets/images/stage_complete.svg')
        ],
        use: [
          {
            loader: path.resolve('./src/webpack-svg-pixi-loader.js'),
          },
        ],
      },
      {
        test: /\.svg/i,
        include: [
          path.resolve('./assets/images/instrument-icons'),
        ],
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets/images',
              name: '[contenthash].png',
            },
          },
          {
            loader: path.resolve('./src/webpack-svg-to-png.js'),
            options: {
              width: 128,
              height: 128,
            },
          },
        ]
      },
      {
        test: /\.svg/i,
        include: [
          path.resolve('./assets/images/note-notations'),
        ],
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets/images',
              name: '[contenthash].png',
            },
          },
          {
            loader: path.resolve('./src/webpack-svg-to-png.js'),
            options: {
              width: 32,
              height: 32,
            },
          },
        ]
      },
      {
        test: /\.svg/i,
        include: [
          path.resolve('./assets/images/stage_complete_2.svg')
        ],
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets/images',
              name: '[contenthash].png',
            },
          },
          {
            loader: path.resolve('./src/webpack-svg-to-png.js'),
          },
        ]
      },
      {
        test: /\.svg/i,
        include: [
          path.resolve('./assets/images/environments')
        ],
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets/images',
              name: '[contenthash].png',
            },
          },
          {
            loader: path.resolve('./src/webpack-svg-to-png.js'),
            options: {
              multiplier: 1,
            }
          },
        ]
      },
      {
        test: /\.(ogg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets/music',
            },
          },
        ],
      },
      {
        test: /\.(mp4|webm)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets/video',
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './assets/css/'
            }
          },
          "css-loader"
        ]
      }
    ]
  },
  optimization: {
    splitChunks: {
      name: 'vendor',
      chunks: 'all'
    }
  }
};

const front = {
  ...frontBase,
  name: 'watch',
  mode: 'development',
  devtool: 'sourcemap',
}

const frontWatch = {
  ...frontBase,
  name: 'watch',
  mode: 'development',
  devtool: 'sourcemap',
  watch: true,
  plugins: [
    ...frontBase.plugins,
    new BrowserSyncPlugin({
      host: process.env.IP || 'localhost',
      port: process.env.PORT || 3000,
      server: {
        baseDir: ['dist/public']
      },
    })
  ]
}

module.exports = (env) => {
  if(env && env.watch) {
    return [frontWatch];
  } else {
    return [front];
  }
}