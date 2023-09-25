const webpack = require('webpack');
const withWorkers = require('@zeit/next-workers');

module.exports = withWorkers({
  reactStrictMode: true,
  transpilePackages: ["ui"],
  webpack: (config) => {
    config.plugins.push(
      // ../../node_modules/.pnpm/web-worker@1.2.0/node_modules/web-worker/cjs/node.js
      // Critical dependency: the request of a dependency is an expression
      // This below seems needed to fix the above * warning * (not error)
      new webpack.ContextReplacementPlugin(/web-worker/),
    )
    return config
  },
  async headers() {
    return [
      {
        source: '/(.*?)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          }
        ],
      },
    ]
  }
});
