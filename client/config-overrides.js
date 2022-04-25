const webpack = require("webpack");

module.exports = function override(config, env) {
  config.resolve.fallback = {
    fs: false,
    os: false,
    tls: false,
    net: false,
    path: false,
    zlib: false,
    http: false,
    https: false,
    stream: false,
    crypto: false,
    assert: false,
    process: false,
    Buffer: require.resolve("buffer"),
  };
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    })
  );

  return config;
};
