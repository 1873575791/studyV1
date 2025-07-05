const { MFSU } = require('@umijs/mfsu');
const webpack = require('webpack');

// [mfsu] 1. init instance
const mfsu = new MFSU({
  implementor: webpack,
  buildDepWithESBuild: true,
});

module.exports = {
    devServer: {
      // [mfsu] 2. add mfsu middleware
      optimization: {
        runtimeChunk: {
          name: (entrypoint) => `runtime~${entrypoint.name}`,
        },
      },
    },
};