const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const env = require("../env");
const proxyRules = require("../proxy/rules");

module.exports = {

  devtool: "inline-source-map",
  mode: "development",


  entry: {
    app: ["./src/index.js"],
    // vendor: "./src/vendor.js",
  },

  output: {
    path: path.resolve(__dirname, "../static/dist"),
    filename: "[name].js",
    sourceMapFilename: "[name].map",
    chunkFilename: "[id]-chunk.js",
    publicPath: "/",
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: [
              "@babel/plugin-transform-class-properties",
              "@babel/plugin-transform-object-rest-spread",
            ],
          },
        },
      },
      {
        test: /\.s?css$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        type: "javascript/auto",
        test: /\.(jpg|png|gif|eot|svg|ttf|woff|woff2)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[path][name].[ext]",
            publicPath: "/",
          },
        },
      },
      {
        test: /\.(mp4|webm)$/,
        use: [
          {
            loader: "url-loader",
            options: { limit: 100000 },
          },
        ],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, "../static/index.html"),
      favicon: path.resolve(__dirname, "../static/favicon.ico"),
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],

  devServer: {
    host: env.devServer.host || "localhost",
    port: env.devServer.port || 3000,
    static: {
      directory: path.resolve(__dirname, "../static"),
      watch: {
        ignored: /node_modules/,
      },
    },
    compress: true,
    hot: true,
    historyApiFallback: {
      disableDotRule: true,
    },
    proxy: [proxyRules],
  },

  resolve: {
    extensions: [".js", ".scss"],
    modules: ["node_modules"],
  },
};
