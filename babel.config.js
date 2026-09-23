/**
 * Expo's own preset, plus one plugin of ours that makes the app's styles
 * follow the theme the admin dashboard publishes (see babel/themed-styles.js).
 *
 * `babel-preset-expo` ships as a dependency of the `expo` package. It is
 * resolved from there, the way Expo finds it for a project with no Babel
 * config, rather than asking for a second copy to be installed.
 */
const path = require('path');

function expoPreset() {
  try {
    return require.resolve('babel-preset-expo');
  } catch {
    const expoDir = path.dirname(require.resolve('expo/package.json'));
    return require.resolve('babel-preset-expo', { paths: [expoDir] });
  }
}

module.exports = function config(api) {
  api.cache(true);
  return {
    presets: [expoPreset()],
    plugins: [require.resolve('./babel/themed-styles')],
  };
};
