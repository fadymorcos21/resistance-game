const { withExpoWebpack } = require("@expo/webpack-config");

module.exports = async function (env, argv) {
  return await withExpoWebpack({
    ...env,
    projectRoot: __dirname,
  });
};
