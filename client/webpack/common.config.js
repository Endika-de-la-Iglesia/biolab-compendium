const path = require("path");

module.exports = {
  entry: {
    app: ["./src/index.js"],
  },
  resolve: {
    extensions: [".js", ".json", ".scss"],
    modules: ["node_modules"],
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
    ],
  },
};
