const webpack = require('webpack');

module.exports = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
  webpack: (config) => {
    config.plugins.push(
      // ../../node_modules/.pnpm/web-worker@1.2.0/node_modules/web-worker/cjs/node.js
      // Critical dependency: the request of a dependency is an expression
      // This below seems needed to fix the above * warning * (not error)
      new webpack.ContextReplacementPlugin(/web-worker/)
    )
    return config
  }
};
