const path = require("path");
const { merge } = require("webpack-merge");
const webpackCommon = require("./common.config");

// webpack plugins
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(webpackCommon, {
  bail: true,

  devtool: "source-map",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name]-[fullhash].min.js",
    sourceMapFilename: "[file].map",
    chunkFilename: "[id]-[fullhash].js",
    publicPath: "/biolab-compendium/",
  },

  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },

  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, "../static/index.html"),
      favicon: path.resolve(__dirname, "../static/favicon.ico"),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "../static"),
          to: path.resolve(__dirname, "../dist"),
          globOptions: {
            ignore: ["**/index.html", "**/favicon.ico"],
          },
        },
        {
          from: path.resolve(__dirname, "../_redirects"),
          to: path.resolve(__dirname, "../dist"),
        },
      ],
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, "../dist/**/*")],
      cleanStaleWebpackAssets: true,
      protectWebpackAssets: false,
    }),
    new DefinePlugin({
      "process.env": {
        NODE_ENV: '"production"',
      },
    }),
    new MiniCssExtractPlugin({
      filename: "[name]-[contenthash].min.css",
    }),
  ],
});
