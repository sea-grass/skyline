const path = require("path");
const webpack = require("webpack");

module.exports = {
  target: "webworker",
  entry: "./worker.js",
  mode: "production",
  node: {
    fs: "empty"
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.browser": "true"
    })
  ]
};
